/* eslint-disable @typescript-eslint/no-require-imports */
// The real shared workflow runs against an entirely in-memory provider fixture.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runBulk, parseBulkArgs } = require('./.build/setup-vercel-all.js');
const { setup, runSingle, VercelApiError } = require('./.build/setup-vercel.js');
const { resolveTemplate } = require('./.build/manifest.js');
const { initialSetupState, loadSetupState, saveSetupState, validateSetupState, acquireLock, SetupError } = require('./.build/setup-state.js');
function world(options = {}) {
  const projects = new Map(), deployments = new Map(), calls = [], logs = [];
  const link = (id = '001') => ({ type: 'github', org: 'taeminers', repo: resolveTemplate(id).deploymentRepository.split('/')[1], repoId: 123, productionBranch: 'main' });
  for (const id of ['001', '002']) projects.set(id, { id: `prj_${id}`, name: `grids-demo-${id}`, accountId: 'team_test', link: link(), rootDirectory: resolveTemplate(id).libraryDirectory });
  let active = null, sequence = [], httpsPending = new Set(options.httpsPending || []), failBuild = new Set(options.failBuild || []);
  const clone = value => structuredClone(value);
  const deps = {
    log: text => logs.push(text), sleep: async () => {},
    github: url => {
      calls.push(['github', 'GET', url]);
      if (url.includes('package.json')) return { type: 'file', encoding: 'base64', content: Buffer.from(JSON.stringify({ dependencies: { astro: '5' }, scripts: { build: 'astro build' } })).toString('base64') };
      if (url.includes('/contents/')) return [];
      return { id: 123, full_name: url.slice('/repos/'.length), default_branch: 'main' };
    },
    api: async (url, method = 'GET', body) => {
      calls.push(['vercel', method, url, body]);
      const parsed = new URL(url, 'https://api.vercel.com');
      if (url.includes('/v9/projects/grids-demo-001')) return clone(projects.get('001'));
      if (url.includes('/v9/projects/grids-demo-002')) return clone(projects.get('002'));
      assert.equal(parsed.searchParams.get('teamId'), 'team_test');
      if (method === 'POST' && parsed.pathname === '/v11/projects') {
        const id = body.name.slice(-3); assert(!projects.has(id));
        assert.deepEqual(body.gitRepository, { type: 'github', repo: resolveTemplate(id).deploymentRepository });
        assert.equal(body.rootDirectory, resolveTemplate(id).libraryDirectory);
        const p = { ...body, id: `prj_${id}`, name: body.name, accountId: 'team_test', link: link(id), targets: {} }; projects.set(id, p); return clone(p);
      }
      if (parsed.pathname.startsWith('/v9/projects/')) {
        const id = parsed.pathname.slice(-3);
        if (!projects.has(id)) throw new VercelApiError(404, 'not_found');
        if (method === 'PATCH') Object.assign(projects.get(id), body);
        return clone(projects.get(id));
      }
      if (parsed.pathname === '/v6/deployments') {
        const projectId = parsed.searchParams.get('projectId');
        return { deployments: [...deployments.values()].filter(d => d.projectId === projectId).map(d => ({ ...d, uid: d.id, meta: { githubCommitOrg: 'taeminers', githubCommitRepo: resolveTemplate(d.projectId.slice(-3)).deploymentRepository.split('/')[1], githubCommitRef: 'main' } })) };
      }
      if (parsed.pathname === '/v13/deployments' && method === 'POST') {
        const id = body.project.slice(-3); assert.equal(body.name, `grids-demo-${id}`);
        assert.deepEqual(body.gitSource, { type: 'github', repoId: '123', ref: 'main' });
        const deploymentId = `dpl_${id}_${deployments.size}`;
        const d = { id: deploymentId, projectId: body.project, target: 'production', gitSource: clone(body.gitSource), readyState: failBuild.has(id) ? 'ERROR' : 'READY', url: `demo-${id}.vercel.app`, createdAt: Date.now() };
        deployments.set(deploymentId, d); projects.get(id).targets.production = { id: deploymentId };
        return clone(d);
      }
      if (parsed.pathname.startsWith('/v13/deployments/')) return clone(deployments.get(parsed.pathname.split('/').pop()));
      throw new Error(`Unexpected fixture API ${url}`);
    },
    connect: (projectId, accountId) => { assert.equal(accountId, 'team_test'); calls.push(['connect', 'POST', projectId]); projects.get(projectId.slice(-3)).link = link(projectId.slice(-3)); },
    domain: async (template, projectId, accountId, dryRun) => {
      const id = template.id; calls.push(['domain', dryRun ? 'GET' : 'POST', id]);
      assert(!['001', '002'].includes(id)); assert.equal(projectId, `prj_${id}`); assert.equal(accountId, 'team_test');
      if (dryRun) {
        if (active !== id) { active = id; sequence.push(id); }
      } else assert.equal(active, id);
      if (options.dnsFailure === id) throw new SetupError(`Unexpected DNS record at demo-${id}; refused overwrite.`);
      return 'SUCCESS';
    },
    https: async domain => !httpsPending.has(domain.match(/demo-(\d{3})/)[1]),
  };
  return { deps, calls, logs, projects, deployments, sequence, httpsPending, failBuild };
}
function temp(t) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-bulk-test-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true })); return path.join(dir, 'state.json'); }
test('bulk refuses omitted, conflicting, duplicate and unknown modes', () => {
  assert.deepEqual(parseBulkArgs(['--dry-run']), { execute: false, scope: undefined });
  for (const args of [[], ['--execute', '--dry-run'], ['--execute', '--execute'], ['--id=003', '--execute'], ['--all'], ['--execute', '--scope=a', '--scope=b']]) assert.throws(() => parseBulkArgs(args));
});
test('bulk dry-run is offline, writes no state and lists all 51 mappings', async t => {
  const statePath = temp(t), w = world();
  await runBulk({ execute: false }, w.deps, statePath);
  assert.equal(w.calls.length, 0); assert.equal(fs.existsSync(statePath), false);
  assert.equal(w.logs.filter(s => s.includes('Planned action:')).length, 51);
  assert(w.logs.some(s => s.includes('templates/051-zeroindex')));
});
test('bulk uses shared setup, processes sequentially, isolates failures and resumes HTTPS without redeploy', async t => {
  const statePath = temp(t), w = world({ failBuild: ['030'], dnsFailure: '033', httpsPending: ['032'] });
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.equal(result.alreadyReady, 2); assert.equal(result.newlyReady, 46);
  assert.deepEqual(result.failed, ['030', '033']); assert.deepEqual(result.httpsPending, ['032']);
  assert.deepEqual(w.sequence, Array.from({ length: 49 }, (_, i) => String(i + 3).padStart(3, '0')));
  const saved = loadSetupState(statePath);
  assert.equal(saved.templates[29].status, 'failed'); assert.equal(saved.templates[30].status, 'ready');
  assert.equal(saved.templates[31].status, 'domain-configured');
  assert(saved.templates[31].deploymentUrl); assert.equal(saved.accountId, 'team_test');
  for (const c of w.calls) {
    if (c[0] === 'vercel' && (c[2].includes('grids-demo-001') || c[2].includes('grids-demo-002'))) assert.equal(c[1], 'GET');
    if (c[0] === 'connect') assert(!['prj_001', 'prj_002'].includes(c[2]));
    if (c[0] === 'domain') assert(!['001', '002'].includes(c[2]));
  }
  const projectsBefore = w.calls.filter(c => c[1] === 'POST' && c[2].startsWith('/v11/projects')).length;
  const deploymentsForSeven = w.calls.filter(c => c[2].startsWith('/v13/deployments') && c[1] === 'POST' && c[3]?.project === 'prj_032').length;
  w.httpsPending.clear(); w.failBuild.clear();
  for (const d of w.deployments.values()) d.readyState = 'READY';
  const resumed = await runBulk({ execute: true }, w.deps, statePath);
  assert.equal(resumed.alreadyReady, 50); assert.equal(resumed.newlyReady, 0); assert.deepEqual(resumed.failed, ['033']);
  assert.equal(w.calls.filter(c => c[1] === 'POST' && c[2].startsWith('/v11/projects')).length, projectsBefore);
  assert.equal(w.calls.filter(c => c[2].startsWith('/v13/deployments') && c[1] === 'POST' && c[3]?.project === 'prj_032').length, deploymentsForSeven);
});
test('protected single IDs skip before invoking any dependency', async () => {
  const w = world(); for (const id of ['001', '002']) assert.equal(await setup({ id, execute: true }, w.deps), 'skipped');
  assert.equal(w.calls.length, 0);
});
test('account mismatch stops all mutations before project creation', async t => {
  const statePath = temp(t), w = world(); w.projects.get('002').accountId = 'team_other';
  await assert.rejects(runBulk({ execute: true }, w.deps, statePath), /different Vercel accounts/);
  assert(w.calls.every(c => c[1] === 'GET')); assert.equal(fs.existsSync(statePath), false);
});
test('state initializes protected IDs ready and rejects unsafe mappings/secrets', t => {
  const statePath = temp(t), state = initialSetupState();
  assert.deepEqual(state.templates.slice(0, 2).map(e => e.status), ['ready', 'ready']);
  assert(state.templates.slice(2).every(e => e.status === 'pending'));
  saveSetupState(statePath, state); assert.deepEqual(loadSetupState(statePath), state);
  assert(!fs.readdirSync(path.dirname(statePath)).some(f => f.endsWith('.tmp')));
  assert.equal(fs.statSync(statePath).mode & 0o777, 0o600);
  const unsafe = structuredClone(state); unsafe.templates[2].customDomain = 'www.gridsagency.com'; assert.throws(() => validateSetupState(unsafe));
  const secret = structuredClone(state); secret.templates[2].token = 'never-store'; assert.throws(() => validateSetupState(secret));
  state.templates[0].status = 'pending'; assert.throws(() => validateSetupState(state));
});
test('single and bulk share locking and state; READY is skipped with no remote calls', async t => {
  const statePath = temp(t), w = world();
  await runSingle({ id: '003', execute: true }, w.deps, statePath);
  assert.equal(loadSetupState(statePath).templates[2].status, 'ready');
  const before = w.calls.length; await runSingle({ id: '003', execute: true }, w.deps, statePath); assert.equal(w.calls.length, before);
  const release = acquireLock(`${statePath}.lock`);
  await assert.rejects(runSingle({ id: '004', execute: true }, w.deps, statePath), /active/);
  release();
});
test('unknown provider errors never persist credentials and later templates continue', async t => {
  const statePath = temp(t), w = world(); const github = w.deps.github;
  w.deps.github = url => { if (url.includes('003-')) throw new Error('Bearer fixture-secret'); return github(url); };
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.deepEqual(result.failed, ['003']); assert.equal(result.newlyReady, 48);
  assert(!fs.readFileSync(statePath, 'utf8').includes('fixture-secret'));
  assert(!w.logs.join('\n').includes('fixture-secret'));
});
test('an ambiguous deployment POST is inspected on resume, never blindly repeated', async t => {
  const statePath = temp(t), w = world(); const api = w.deps.api;
  w.deps.api = async (url, method, body) => { if (url.startsWith('/v13/deployments?') && method === 'POST') throw new Error('lost response'); return api(url, method, body); };
  await assert.rejects(runSingle({ id: '003', execute: true }, w.deps, statePath));
  const state = loadSetupState(statePath); assert(state.templates[2].deploymentRequestedAt); assert(!state.templates[2].deploymentId);
  w.deps.api = api;
  await assert.rejects(runSingle({ id: '003', execute: true }, w.deps, statePath), /uncertain outcome/);
  assert.equal(w.deployments.size, 0);
});

test('interruption after root PATCH cannot reuse the old production build', async t => {
  const statePath = temp(t), w = world();
  const oldDeployment = { id: 'dpl_old', projectId: 'prj_003', target: 'production', gitSource: { type: 'github', repoId: '123', ref: 'main' }, readyState: 'READY', url: 'old.vercel.app', createdAt: Date.now() };
  w.deployments.set(oldDeployment.id, oldDeployment);
  w.projects.set('003', { id: 'prj_003', name: 'grids-demo-003', accountId: 'team_test', link: structuredClone(w.projects.get('001').link), rootDirectory: 'wrong-root', targets: { production: { id: oldDeployment.id } } });
  const api = w.deps.api;
  w.deps.api = async (url, method, body) => { const result = await api(url, method, body); if (method === 'PATCH') throw new Error('interrupted after PATCH'); return result; };
  await assert.rejects(runSingle({ id: '003', execute: true }, w.deps, statePath));
  assert.equal(loadSetupState(statePath).templates[2].needsDeployment, true);
  w.deps.api = api; await runSingle({ id: '003', execute: true }, w.deps, statePath);
  assert.equal(w.deployments.size, 2); assert.equal(loadSetupState(statePath).templates[2].status, 'ready');
});
test('lost successful deployment POST is recovered by read without another POST', async t => {
  const statePath = temp(t), w = world(), api = w.deps.api;
  w.deps.api = async (url, method, body) => { const result = await api(url, method, body); if (url.startsWith('/v13/deployments?') && method === 'POST') throw new Error('response lost after success'); return result; };
  await assert.rejects(runSingle({ id: '003', execute: true }, w.deps, statePath));
  assert.equal(w.deployments.size, 1); assert(!loadSetupState(statePath).templates[2].deploymentId);
  w.deps.api = api; await runSingle({ id: '003', execute: true }, w.deps, statePath);
  assert.equal(w.deployments.size, 1); assert.equal(loadSetupState(statePath).templates[2].status, 'ready');
});

test('reconciled 001–003 are skipped; bulk resumes at 004 and continues sequentially through 051', async t => {
  const statePath = temp(t), w = world({ failBuild: ['030'] });
  await runSingle({ id: '003', execute: true }, w.deps, statePath);
  w.calls.length = 0; w.sequence.length = 0;
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.equal(result.alreadyReady, 3);
  assert.deepEqual(w.sequence, Array.from({ length: 48 }, (_, i) => String(i + 4).padStart(3, '0')));
  assert.deepEqual(result.failed, ['030']);
  assert.equal(loadSetupState(statePath).templates[3].status, 'ready');
  assert.equal(loadSetupState(statePath).templates[50].status, 'ready');
  assert(w.calls.some(c => c[0] === 'github' && c[2].includes('003-astromaxsp')));
  assert(!w.calls.some(c => c[0] === 'vercel' && c[1] !== 'GET' && /projects\/(?:grids-demo-003|prj_003)/.test(c[2])));
  assert(!w.calls.some(c => c[0] === 'vercel' && c[1] === 'POST' && c[3]?.name === 'grids-demo-003'));
  assert(!w.calls.some(c => c[0] === 'domain' && c[1] !== 'GET' && c[2] === '003'));
  const logs = [];
  await runBulk({ execute: false }, { log: s => logs.push(s), api: () => { throw Error('Dry-run network'); } }, statePath);
  assert(logs.some(s => s.includes('003 — astromaxsp')));
});

test('historical mirror failures stay failed during planning and retry with manifest Git sources', async t => {
  const statePath = temp(t), state = initialSetupState(), w = world();
  for (const entry of state.templates.filter(e => Number(e.id) >= 26)) {
    entry.status = 'failed'; entry.lastError = 'Historical Git repository 25-project limit';
  }
  saveSetupState(statePath, state);
  const before = fs.readFileSync(statePath, 'utf8');
  await runBulk({ execute: false }, w.deps, statePath);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
  assert(w.logs.some(s => s.includes('Deployment Git Repository: taeminers/grids-template-deploy-2')));
  assert(w.logs.some(s => s.includes('Deployment Git Repository: taeminers/grids-template-deploy-3')));
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.equal(result.newlyReady, 49); assert.deepEqual(result.failed, []);
  const creations = w.calls.filter(c => c[0] === 'vercel' && c[1] === 'POST' && c[2].startsWith('/v11/projects'));
  assert.equal(creations.length, 49);
  for (const call of creations) {
    const id = call[3].name.slice(-3);
    assert(Number(id) >= 3);
    assert.equal(call[3].gitRepository.repo, resolveTemplate(id).deploymentRepository);
  }
});

test('bulk reconciles stale checkpoints, skips externally ready 003/026 and resumes master-range projects', async t => {
  const statePath = temp(t), w = world();
  for (const id of ['003', '004', '025', '026', '027']) await runSingle({ id, execute: true }, w.deps, statePath);
  const state = loadSetupState(statePath);
  for (const id of ['003', '004', '025', '026']) {
    const entry = state.templates.find(e => e.id === id);
    entry.status = 'failed'; entry.lastError = 'Historical pending/failure';
  }
  state.templates.find(e => e.id === '027').status = 'domain-configured';
  saveSetupState(statePath, state);
  // A master-range project was partially created by the earlier batch.
  w.projects.set('005', { ...structuredClone(w.projects.get('004')), id: 'prj_005', name: 'grids-demo-005', rootDirectory: resolveTemplate('005').libraryDirectory, targets: {} });
  w.calls.length = 0; w.logs.length = 0;
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.equal(result.alreadyReady, 7); assert.equal(result.newlyReady, 44);
  assert(!w.calls.some(c => c[0] === 'vercel' && c[1] === 'POST' && c[2].startsWith('/v11/projects') && c[3]?.name === 'grids-demo-005'));
  assert(w.calls.some(c => c[0] === 'vercel' && c[1] === 'POST' && c[3]?.project === 'prj_005'));
  const readyIds = ['001', '002', '003', '004', '025', '026', '027'];
  for (const id of readyIds) {
    assert.equal(loadSetupState(statePath).templates.find(e => e.id === id).status, 'ready');
    assert(!w.calls.some(c => c[0] === 'vercel' && c[1] !== 'GET' && (c[2].includes(`prj_${id}`) || c[3]?.name === `grids-demo-${id}` || c[3]?.project === `prj_${id}`)));
    assert(!w.calls.some(c => c[0] === 'domain' && c[1] !== 'GET' && c[2] === id));
    assert(!w.calls.some(c => c[0] === 'connect' && c[2] === `prj_${id}`));
  }
  const firstWrite = w.calls.findIndex(c => c[1] === 'POST' || c[1] === 'PATCH');
  assert(firstWrite > w.calls.findIndex(c => c[0] === 'github' && c[2].includes('051-zeroindex')));
});

test('failed read-only reconciliation blocks writes only for that template and continues the batch', async t => {
  const statePath = temp(t), w = world();
  const api = w.deps.api; let attempts = 0;
  w.deps.api = async (url, method = 'GET', body) => {
    if (url.includes('projects/grids-demo-030')) { attempts++; throw new Error('Network request timed out'); }
    return api(url, method, body);
  };
  const result = await runBulk({ execute: true }, w.deps, statePath);
  assert.deepEqual(result.failed, ['030']); assert.equal(attempts, 3);
  assert(!w.projects.has('030')); assert(w.projects.has('031')); assert(w.projects.has('051'));
});
