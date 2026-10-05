/* eslint-disable @typescript-eslint/no-require-imports */
// Offline tests: all GitHub, Vercel, DNS and HTTPS operations are synthetic.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, parseArgs, VercelApiError } = require('./.build/setup-vercel.js');
const { resolveTemplate, loadManifest } = require('./.build/manifest.js');
function fixture(overrides = {}) {
  const calls = [], logs = [];
  let project = { id: 'prj_003', accountId: 'team_test', name: 'grids-demo-003', targets: {}, ...overrides.project };
  const link = { type: 'github', org: 'taeminers', repo: 'grids-template-library', repoId: 123, productionBranch: 'main' };
  const deps = {
    log: message => logs.push(message), sleep: async () => {}, https: async () => true,
    github: path => path.includes('contents') && !path.includes('package.json') ? [] : path.includes('contents') ? { type: 'file', encoding: 'base64', content: Buffer.from(JSON.stringify({ dependencies: { astro: '5' }, scripts: { build: 'astro build' } })).toString('base64') } : { id: 123, full_name: 'taeminers/grids-template-library', default_branch: overrides.branch || 'main' },
    connect: (id, account) => { calls.push(['connect', id, account]); project.link = link; },
    domain: async (_, id, account, dryRun) => { calls.push(['domain', id, account, dryRun]); return 'SUCCESS'; },
    api: async (path, method = 'GET', body) => {
      calls.push([method, path, body]);
      if (overrides.missing) throw new Error('404');
      if (path.startsWith('/v6/deployments')) return { deployments: overrides.deployments || [] };
      if (path.startsWith('/v13/deployments') && method === 'POST') { project.targets.production = { id: 'dpl_test' }; return { id: 'dpl_test' }; }
      if (path.startsWith('/v13/deployments/dpl_test')) return { url: 'test.vercel.app', id: 'dpl_test', projectId: 'prj_003', target: 'production', readyState: overrides.buildFailure ? 'ERROR' : 'READY', gitSource: { type: 'github', repoId: '123', ref: 'main' } };
      if (method === 'PATCH') Object.assign(project, body);
      return structuredClone(project);
    },
  };
  return { calls, logs, deps, link };
}
test('strict single-ID parsing and protected targets', () => {
  assert.deepEqual(parseArgs(['--id=003', '--dry-run']), { id: '003', execute: false, scope: undefined });
  for (const args of [['--id=000', '--execute'], ['--id=003'], ['--id=003', '--execute', '--dry-run'], ['--id=003', '--execute', '--all']]) assert.throws(() => parseArgs(args));
  assert.equal(loadManifest().length, 51);
  assert.equal(resolveTemplate('003').libraryDirectory, 'templates/003-astromaxsp');
});
test('dry run performs only reads; does not connect/deploy', async () => {
  const f = fixture(); await setup({ id: '003', execute: false, accountId: 'team_test' }, f.deps);
  assert(f.calls.every(c => c[0] === 'GET' || (c[0] === 'domain' && c[3] === true)));
  assert(f.logs.some(s => s.includes('templates/003-astromaxsp')));
});
test('existing CLI project converted in place with Git-source production deployment', async () => {
  const f = fixture(); await setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps);
  assert.deepEqual(f.calls.find(c => c[0] === 'connect'), ['connect', 'prj_003', 'team_test']);
  const patch = f.calls.find(c => c[0] === 'PATCH');
  assert.equal(patch[2].rootDirectory, 'templates/003-astromaxsp');
  assert.equal(patch[2].framework, 'astro');
  assert(!f.calls.some(c => c[1] === '/v11/projects' || c[0] === 'DELETE'));
  const deployment = f.calls.find(c => c[0] === 'POST');
  assert.equal(deployment[2].project, 'prj_003');
  assert.deepEqual(deployment[2].gitSource, { type: 'github', repoId: '123', ref: 'main' });
});
test('wrong project, foreign Git repository and production branch fail before mutations', async () => {
  for (const project of [{ name: 'grids-demo-001' }, { link: { type: 'github', org: 'Lexington-Themes', repo: 'astromaxsp' } }, { link: { type: 'github', org: 'taeminers', repo: 'grids-template-library', repoId: 123, productionBranch: 'develop' } }]) {
    const f = fixture({ project }); await assert.rejects(setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps));
    assert(f.calls.every(c => c[0] === 'GET'));
  }
});
test('unclassified lookup failure never creates a replacement project', async () => {
  const f = fixture({ missing: true }); await assert.rejects(setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps));
  assert(f.calls.every(c => c[0] === 'GET'));
});
test('DNS preflight conflict stops project writes', async () => {
  const f = fixture(); f.deps.domain = async () => { throw new Error('DNS conflict'); };
  await assert.rejects(setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps));
  assert(f.calls.every(c => c[0] === 'GET'));
});
test('failed build never configures domain or DNS', async () => {
  const f = fixture({ buildFailure: true }); await assert.rejects(setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps), /build failed/);
  assert(!f.calls.some(c => c[0] === 'domain' && c[3] === false));
});

test('already configured active production is reused without writes or reconnecting', async () => {
  const f = fixture({ project: { link: { type: 'github', org: 'taeminers', repo: 'grids-template-library', repoId: 123, productionBranch: 'main' }, rootDirectory: 'templates/003-astromaxsp', framework: 'astro', targets: { production: { id: 'dpl_test' } } }, deployments: [{ uid: 'dpl_test', target: 'production', state: 'READY', meta: { githubCommitOrg: 'taeminers', githubCommitRepo: 'grids-template-library', githubCommitRef: 'main' } }] });
  await setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps);
  assert(!f.calls.some(c => ['PATCH', 'POST', 'connect'].includes(c[0])));
});
test('Git connection returning a wrong branch stops before production deployment', async () => {
  const f = fixture(); f.link.productionBranch = 'develop';
  await assert.rejects(setup({ id: '003', execute: true, accountId: 'team_test' }, f.deps), /verification failed/);
  assert(!f.calls.some(c => c[0] === 'POST'));
});

test('REST preserves authenticated 404 status and redacts the actual token', async () => {
  const { vercelRequest } = require('./.build/vercel-rest.js');
  let calls = 0;
  await assert.rejects(vercelRequest('/v9/projects/grids-demo-003', 'GET', undefined, 'fixture-secret', async () => {
    calls++; return new Response(JSON.stringify({ error: { code: 'not_found', message: 'Project missing fixture-secret' } }), { status: 404 });
  }), error => error instanceof VercelApiError && error.status === 404 && error.code === 'not_found' && !error.message.includes('fixture-secret'));
  assert.equal(calls, 1);
});

test('REST retains non-JSON 404 and never retries a 503 write', async () => {
  const { vercelRequest } = require('./.build/vercel-rest.js');
  await assert.rejects(vercelRequest('/v9/projects/grids-demo-003', 'GET', undefined, 'secret', async () => new Response('private error body secret', { status: 404 })), e => e instanceof VercelApiError && e.status === 404 && !e.message.includes('secret'));
  let attempts = 0;
  await assert.rejects(vercelRequest('/v11/projects?teamId=team_test', 'POST', { name: 'grids-demo-003' }, 'secret', async (_, options) => {
    attempts++; assert.equal(options.redirect, 'manual'); assert.equal(options.method, 'POST');
    return new Response(JSON.stringify({ error: { code: 'unavailable', message: 'Service unavailable' } }), { status: 503 });
  }), /PROJECT_CREATE_FAILED.*503/);
  assert.equal(attempts, 1);
});

test('all permanent deployment repository ranges validate; wrong assignments fail closed', () => {
  const { templateManifest } = require('./.build/manifest.js');
  const counts = {};
  for (const template of loadManifest()) {
    const expected = Number(template.id) <= 25 ? 'taeminers/grids-template-library' :
      Number(template.id) <= 38 ? 'taeminers/grids-template-deploy-2' : 'taeminers/grids-template-deploy-3';
    assert.equal(template.deploymentRepository, expected);
    counts[expected] = (counts[expected] || 0) + 1;
  }
  assert.deepEqual(Object.values(counts), [25, 13, 13]);
  for (const id of ['001', '025', '026', '038', '039', '051']) {
    const entry = templateManifest.find(t => t.id === id), original = entry.deploymentRepository;
    try { entry.deploymentRepository = 'taeminers/incorrect'; assert.throws(() => loadManifest(), /Invalid/); }
    finally { entry.deploymentRepository = original; }
  }
});
