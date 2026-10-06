/* eslint-disable @typescript-eslint/no-require-imports */
// Diagnose 003 only; every CLI/API is mocked. No real provider calls.
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { diagnoseTemplate } = require('./.build/setup-diagnose.js');
const { parseArgs, mainDependencies } = require('./.build/setup-vercel.js');
const { sanitizeDiagnostic, operationForRequest, VercelApiError, VercelOperationError } = require('./.build/vercel-errors.js');
function fixture(t, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-diagnose-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const libraryRoot = path.join(root, 'library'), cliConfig = path.join(root, 'config.json');
  fs.mkdirSync(path.join(libraryRoot, 'templates/003-astromaxsp'), { recursive: true });
  fs.writeFileSync(cliConfig, JSON.stringify({ currentTeam: 'team_test', token: 'must-never-print-config-token' }));
  fs.mkdirSync(path.join(root, '.tmp'));
  const statePath = path.join(root, '.tmp/templates-setup-state.json');
  fs.writeFileSync(statePath, JSON.stringify({ version: 1, accountId: 'team_test', templates: [{ id: '003', status: 'failed', lastError: 'Authorization: Bearer private-state-token', token: 'private-state-token', lastSuccessfulStage: 'Project' }, { id: '004', lastError: 'do-not-process-004' }] }));
  const stateBefore = fs.readFileSync(statePath, 'utf8'), calls = [], logs = [];
  const deps = {
    log: line => logs.push(line),
    api: async (url, method) => {
      calls.push(['api', url, method]); assert.equal(method, 'GET');
      if (url === '/v2/user') { if (options.authFailure) throw new VercelApiError(401, 'unauthorized', 'AUTH_USER', 'login required'); return { user: { id: 'user_test', username: 'tester', token: 'private-user-token' } }; }
      if (url.startsWith('/v2/teams/')) return { id: 'team_test', slug: 'test-team', token: 'private-team-token' };
      if (url.startsWith('/v1/integrations/git-namespaces')) return [{ provider: 'github', slug: 'taeminers', id: 123, isAccessRestricted: false, requireReauth: false }];
      if (url.startsWith('/v1/integrations/search-repo')) {
        if (options.integrationFailure) throw new VercelApiError(403, 'forbidden', 'GIT_INTEGRATION_INSPECT', 'Access denied: token="private-repo-token"');
        return { repos: [{ name: 'grids-template-library', namespace: 'taeminers', private: true, token: 'private-repo-token' }] };
      }
      const id = url.match(/grids-demo-(\d{3})/)?.[1]; assert(['001', '002', '003'].includes(id));
      if (id === '003' && options.missing) throw new VercelApiError(404, 'not_found', 'PROJECT_INSPECT', 'Project not found');
      return { id: `prj_${id}`, name: `grids-demo-${id}`, accountId: 'team_test', rootDirectory: id === '003' ? 'templates/003-astromaxsp' : null, link: { type: 'github', org: 'taeminers', repo: 'grids-template-library', repoId: 123, productionBranch: 'main', gitCredentialId: 'never-print-credential' }, env: [{ name: 'TOKEN', value: 'never-print-env' }] };
    },
    github: url => { calls.push(['github', url]); assert(!url.includes('004')); return url.includes('/contents/') ? [] : { full_name: 'taeminers/grids-template-library' }; },
    connect: () => assert.fail('diagnostic must not connect'), domain: () => assert.fail('diagnostic must not call domain/DNS logic'), https: () => assert.fail('diagnostic does not deploy or probe HTTPS'), sleep: () => assert.fail('diagnostic must not retry'),
  };
  return { root, statePath, stateBefore, libraryRoot, cliConfig, deps, calls, logs };
}
test('diagnose mode is exclusive, read-only and restricted to 003', () => {
  assert.deepEqual(parseArgs(['--id=003', '--diagnose']), { id: '003', execute: false, diagnose: true, scope: undefined });
  for (const args of [['--id=004', '--diagnose'], ['--id=002', '--diagnose'], ['--id=003', '--diagnose', '--execute'], ['--id=003', '--dry-run', '--diagnose'], ['--id=003', '--diagnose', '--diagnose']]) assert.throws(() => parseArgs(args));
});
test('reports 003, user, common scope, local directory, Git access and selected state without writes or secrets', async t => {
  const f = fixture(t);
  const result = await diagnoseTemplate(parseArgs(['--id=003', '--diagnose']), f.deps, f.root, { libraryRoot: f.libraryRoot, cliConfigFiles: [f.cliConfig] });
  assert.equal(result.failures, 0); assert.equal(fs.readFileSync(f.statePath, 'utf8'), f.stateBefore);
  assert(!fs.existsSync(`${f.statePath}.lock`));
  const text = f.logs.join('\n');
  for (const expected of ['grids-demo-003', 'templates/003-astromaxsp', 'tester', 'team_test', '003 existing Git configuration', '003 local setup state']) assert(text.includes(expected));
  for (const forbidden of ['private-state-token', 'must-never-print-config-token', 'private-user-token', 'private-team-token', 'private-repo-token', 'never-print-credential', 'never-print-env', 'do-not-process-004']) assert(!text.includes(forbidden));
  assert(!f.calls.some(c => /grids-demo-00[4-9]|grids-demo-0[1-5]\d|domains|deployments/.test(c[1])));
});
test('404 is reported as not visible without creating or stopping other reads', async t => {
  const f = fixture(t, { missing: true });
  await diagnoseTemplate(parseArgs(['--id=003', '--diagnose']), f.deps, f.root, { libraryRoot: f.libraryRoot, cliConfigFiles: [f.cliConfig] });
  assert(f.logs.some(s => s.includes('NOT VISIBLE') && s.includes('404')));
  assert(f.calls.some(c => c[1].includes('search-repo')));
  assert(!f.logs.some(s => s.includes('003 current project configuration')));
});
test('authentication and integration failures remain distinguishable; inspection continues', async t => {
  const f = fixture(t, { authFailure: true, integrationFailure: true });
  const result = await diagnoseTemplate(parseArgs(['--id=003', '--diagnose']), f.deps, f.root, { libraryRoot: f.libraryRoot, cliConfigFiles: [f.cliConfig] });
  assert.equal(result.failures, 2); const text = f.logs.join('\n');
  assert(text.includes('AUTH_USER_FAILED | HTTP: 401')); assert(text.includes('GIT_INTEGRATION_INSPECT_FAILED | HTTP: 403'));
  assert(!text.includes('private-repo-token')); assert(text.includes('003 existing Git configuration'));
});
test('operation labels distinguish project creation, patching, deployments and domains', () => {
  for (const [url, method, expected] of [['/v11/projects', 'POST', 'PROJECT_CREATE'], ['/v9/projects/prj_003', 'PATCH', 'PROJECT_CONFIG'], ['/v13/deployments?teamId=t', 'POST', 'DEPLOYMENT'], ['/v10/projects/prj_003/domains', 'POST', 'DOMAIN_ASSIGNMENT']]) assert.equal(operationForRequest(url, method), expected);
  assert(new VercelOperationError('GIT_CONNECT', 'Failed to connect').message.includes('GIT_CONNECT_FAILED'));
});
test('redaction removes credentials, headers, URLs, command flags and terminal escapes', () => {
  const text = sanitizeDiagnostic('Error: token="one" password=two --token three https://user:four@site.test?token=five\nAuthorization: Bearer six\nGODADDY_PAT=seven ghp_eight github_pat_nine vcp_ten\nsecret=eleven\u001b[31m');
  for (const secret of ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'ghp_eight', 'github_pat_nine', 'vcp_ten', 'eleven', '\u001b']) assert(!text.includes(secret), text);
});
test('REST failures report operation, HTTP and sanitized description without retrying writes', async () => {
  const { vercelRequest } = require('./.build/vercel-rest.js');
  let calls = 0;
  const failed = async () => { calls++; return new Response(JSON.stringify({ error: { code: 'forbidden', message: 'Project creation denied; token="private-http-token"' } }), { status: 403 }); };
  await assert.rejects(vercelRequest('/v11/projects', 'POST', { name: 'grids-demo-003' }, 'private-http-token', failed), e => e instanceof VercelApiError && e.operation === 'PROJECT_CREATE' && e.status === 403 && !e.message.includes('private-http-token') && e.message.includes('Project creation denied'));
  assert.equal(calls, 1);
  await assert.rejects(mainDependencies({ execute: false }).api('/v11/projects', 'POST', { name: 'grids-demo-003' }), /refused a remote write/);
  await assert.rejects(vercelRequest('/v11/projects', 'POST', {}, 'secret', async () => { calls++; throw new Error('Authorization: secret'); }), /PROJECT_CREATE_FAILED.*No automatic write retry/);
  assert.equal(calls, 2);
});
