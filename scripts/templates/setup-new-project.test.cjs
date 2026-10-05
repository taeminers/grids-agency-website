/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup, VercelApiError } = require('./.build/setup-vercel.js');
const { VercelOperationError } = require('./.build/vercel-errors.js');
const accountId = 'team_wW6olpwil3uF1fzuhElxZniL';
function fixture(failure) {
  const calls = [], logs = [];
  let project;
  const link = { type: 'github', org: 'taeminers', repo: 'grids-template-library', repoId: 123, productionBranch: 'main' };
  const deps = {
    log: s => logs.push(s), sleep: async () => {}, https: async () => true,
    github: p => p.includes('package.json') ? { type: 'file', encoding: 'base64', content: Buffer.from(JSON.stringify({ dependencies: { astro: '5' }, scripts: { build: 'astro build' } })).toString('base64') } : p.includes('contents') ? [] : { id: 123, full_name: 'taeminers/grids-template-library', default_branch: 'main' },
    connect: () => { calls.push(['connect']); if (failure === 'connect') throw new VercelOperationError('GIT_CONNECT', 'Git denied', 403); project.link = link; },
    domain: async (_, id, team, dryRun) => { calls.push(['domain', dryRun]); return 'SUCCESS'; },
    api: async (path, method = 'GET', body) => {
      calls.push([method, path, body]);
      assert.equal(new URL(path, 'https://api.vercel.com').searchParams.get('teamId'), accountId);
      assert(!/grids-demo-(001|002|0(?:0[4-9]|[1-4]\d|5[01]))/.test(path));
      if (path.startsWith('/v11/projects') && method === 'POST') {
        if (failure === 'create') throw new VercelApiError(403, 'forbidden', 'PROJECT_CREATE', 'Creation denied');
        project = { id: 'prj_003', name: body.name, accountId, ...body, link, targets: {} };
        if (failure === 'git-readback') delete project.link;
        if (failure === 'root-readback') project.rootDirectory = 'wrong';
        if (failure === 'account-readback') project.accountId = 'team_wrong';
        if (failure === 'lost-response') throw new VercelOperationError('PROJECT_CREATE', 'Network failure');
        return structuredClone(project);
      }
      if (path.startsWith('/v6/deployments')) return { deployments: [] };
      if (path.startsWith('/v13/deployments') && method === 'POST') {
        if (failure === 'deploy') throw new VercelApiError(400, 'invalid_request', 'DEPLOYMENT', 'Build rejected');
        project.targets.production = { id: 'dpl_003' }; return { id: 'dpl_003' };
      }
      if (path.startsWith('/v13/deployments/dpl_003')) return { id: 'dpl_003', projectId: 'prj_003', target: 'production', readyState: 'READY', url: 'test.vercel.app', gitSource: { type: 'github', repoId: '123', ref: 'main' } };
      if (!project) throw new VercelApiError(failure === 'lookup403' ? 403 : 404, 'not_found', 'PROJECT_INSPECT', 'Not found');
      if (method === 'PATCH') {
        if (failure === 'patch') throw new VercelApiError(400, 'invalid_request', 'PROJECT_CONFIG', 'Configuration rejected');
        Object.assign(project, body);
      }
      return structuredClone(project);
    },
  };
  return { deps, calls, logs, existing: () => { project = { id: 'prj_003', name: 'grids-demo-003', accountId, targets: {} }; } };
}
test('missing project: create connected Astro project in exact team, verify before downstream workflow', async () => {
  const f = fixture();
  // The previous failed entry has no project ID and must remain retryable.
  const entry = { status: 'failed', lastError: 'Previous inspection failed' };
  assert.equal(await setup({ id: '003', execute: true, accountId, entry }, f.deps), 'ready');
  const create = f.calls.find(c => c[0] === 'POST' && c[1].startsWith('/v11/projects'));
  assert.deepEqual(create[2], { name: 'grids-demo-003', rootDirectory: 'templates/003-astromaxsp', framework: 'astro', buildCommand: null, installCommand: null, outputDirectory: null, commandForIgnoringBuildStep: null, gitRepository: { type: 'github', repo: 'taeminers/grids-template-library' } });
  assert(f.logs.some(s => s.startsWith('PROJECT_NOT_FOUND:')));
  assert(f.logs.some(s => s.startsWith('PROJECT_VERIFIED:')));
  assert.equal(entry.projectId, 'prj_003');
  assert(!f.calls.some(c => ['PATCH', 'connect', 'DELETE'].includes(c[0])));
  const readback = f.calls.findIndex(c => c[0] === 'GET' && c[1].includes('/projects/prj_003'));
  assert(readback > f.calls.indexOf(create));
  assert(f.calls.findIndex(c => c[0] === 'domain') > readback);
  assert(f.calls.findIndex(c => c[0] === 'POST' && c[1].includes('/deployments')) > readback);
});
test('404 dry run reports missing and performs no writes; 403 never permits creation', async () => {
  const f = fixture(); assert.equal(await setup({ id: '003', execute: false, accountId }, f.deps), 'planned');
  assert(f.calls.every(c => c[0] === 'GET'));
  const denied = fixture('lookup403'); await assert.rejects(setup({ id: '003', execute: true, accountId }, denied.deps), /PROJECT_INSPECT_FAILED.*403/);
  assert(denied.calls.every(c => c[0] === 'GET'));
});
test('creation rejection reports PROJECT_CREATE_FAILED; one write only and GET recovery', async () => {
  const f = fixture('create');
  await assert.rejects(setup({ id: '003', execute: true, accountId }, f.deps), /PROJECT_CREATE_FAILED.*403.*Creation denied/);
  assert.equal(f.calls.filter(c => c[0] === 'POST').length, 1);
  assert.equal(f.calls.at(-1)[0], 'GET');
});
test('lost creation response recovers through exact GET without a second creation', async () => {
  const f = fixture('lost-response');
  assert.equal(await setup({ id: '003', execute: true, accountId }, f.deps), 'ready');
  assert.equal(f.calls.filter(c => c[0] === 'POST' && c[1].includes('/projects')).length, 1);
});
test('invalid Git/root/account readback stops before deployment and domain workflow', async () => {
  for (const [failure, expected] of [['git-readback', /GIT_CONNECT_FAILED/], ['root-readback', /PROJECT_CONFIG_FAILED/], ['account-readback', /Project\/account/]]) {
    const f = fixture(failure);
    await assert.rejects(setup({ id: '003', execute: true, accountId }, f.deps), expected);
    assert(!f.calls.some(c => c[0] === 'domain' || (c[0] === 'POST' && c[1].includes('/deployments'))));
  }
});
test('Git connection, configuration and deployment failures remain distinct', async () => {
  for (const [failure, expected] of [['connect', /GIT_CONNECT_FAILED.*403/], ['patch', /PROJECT_CONFIG_FAILED.*400/], ['deploy', /DEPLOYMENT_FAILED.*400/]]) {
    const f = fixture(failure); if (failure !== 'deploy') f.existing();
    await assert.rejects(setup({ id: '003', execute: true, accountId }, f.deps), expected);
    assert(!f.calls.some(c => c[0] === 'domain' && c[1] === false));
  }
});
test('saved missing project identity is never silently recreated', async () => {
  const f = fixture(); await assert.rejects(setup({ id: '003', execute: true, accountId, entry: { projectId: 'prj_saved' } }, f.deps), /refusing to recreate/);
  assert(f.calls.every(c => c[0] === 'GET'));
});
