/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { configureDomain } = require('./.build/configure-domain.js');
const { retryRead } = require('./.build/read-retry.js');
const { resolveTemplate } = require('./.build/manifest.js');
const { setup } = require('./.build/setup-vercel.js');

for (const mode of ['missing', 'correct', 'conflict', 'lost-response', 'failed-write', 'read-transient', 'read-exhausted', 'https-pending', 'domain-pending']) {
  test(`026 partial-state reconciliation: ${mode}`, async t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-resume-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const envFile = path.join(dir, '.env.local'); fs.writeFileSync(envFile, 'GODADDY_PAT=fixture-token\n');
    const template = resolveTemplate('026'), calls = [], delays = [];
    const record = { name: 'demo-026', type: 'CNAME', data: 'current.vercel-dns-017.com.', ttl: 600 };
    let records = mode === 'correct' ? [record] : mode === 'conflict' ? [{ ...record, type: 'A', data: '192.0.2.1' }] : [];
    let configReads = 0, dnsReads = 0;
    const project = { id: 'prj_026', name: 'grids-demo-026', accountId: 'team_test',
      link: { type: 'github', org: 'taeminers', repo: 'grids-template-deploy-2', repoId: 226, productionBranch: 'main' },
      rootDirectory: template.libraryDirectory, framework: 'astro', targets: { production: { id: 'dpl_026' } } };
    const deployment = { id: 'dpl_026', projectId: 'prj_026', target: 'production', readyState: 'READY',
      url: 'demo-026.vercel.app', gitSource: { type: 'github', repoId: '226', ref: 'main' },
      meta: { githubCommitOrg: 'taeminers', githubCommitRepo: 'grids-template-deploy-2', githubCommitRef: 'main' } };
    const api = async (url, method = 'GET') => {
      calls.push(['vercel', method, url]); assert.equal(method, 'GET');
      assert(!/demo-(?:00[1-9]|02[57]|03[0-9])(?:\.|\?)/.test(url));
      if (url.includes('/config?')) {
        configReads++;
        if (mode === 'read-exhausted' || (mode === 'read-transient' && configReads < 3)) throw Error('Network request timed out');
        return { recommendedCNAME: [{ rank: 1, value: record.data }], misconfigured: mode === 'domain-pending' || records.length !== 1 || records[0].type !== 'CNAME' };
      }
      if (url.includes('/domains?')) return { domains: [{ name: template.customDomain }] };
      if (url.includes('/domains/')) return { name: template.customDomain, projectId: project.id, verified: true };
      if (url.startsWith('/v6/deployments')) return { deployments: [deployment] };
      if (url.startsWith('/v13/deployments/')) return deployment;
      return structuredClone(project);
    };
    const domain = (_, projectId, accountId, dryRun) => configureDomain({ template, projectId, accountId, envFile,
      api, preserveExisting: true, librarySetup: true, dryRun, attempts: 2, log: () => {}, status: () => {},
      sleep: async ms => delays.push(ms),
      fetchImpl: async (url, init) => {
        calls.push(['godaddy', init.method, String(url)]);
        if (init.method === 'GET') {
          assert.equal(new URL(url).searchParams.get('name'), 'demo-026');
          dnsReads++;
          if (mode === 'read-transient' && dnsReads === 1) throw Error('network unavailable');
          return Response.json({ items: records, totalItems: records.length, totalPages: 1 });
        }
        assert.equal(init.method, 'POST'); assert.deepEqual(JSON.parse(init.body), record);
        if (mode === 'failed-write') throw Error('network lost');
        records = [record];
        if (mode === 'lost-response') throw Error('network lost');
        return Response.json(record, { status: 201 });
      },
    });
    const deps = { api, domain, sleep: async () => {}, log: () => {}, https: async () => mode !== 'https-pending',
      connect: () => { throw Error('Must preserve Git integration'); },
      github: url => url.includes('package.json') ? { type: 'file', encoding: 'base64', content: Buffer.from(JSON.stringify({ dependencies: { astro: '5' }, scripts: { build: 'astro build' } })).toString('base64') } : url.includes('/contents/') ? [] : { id: 226, full_name: template.deploymentRepository, default_branch: 'main' } };
    const entry = { status: 'failed', deploymentId: deployment.id, deploymentSettings: JSON.stringify({ rootDirectory: template.libraryDirectory, framework: 'astro', buildCommand: null, installCommand: null, outputDirectory: null, commandForIgnoringBuildStep: null }) };
    const run = () => setup({ id: '026', execute: true, accountId: 'team_test', entry }, deps);
    if (['conflict', 'read-exhausted', 'failed-write'].includes(mode)) await assert.rejects(run());
    else {
      assert.equal(await run(), ['https-pending', 'domain-pending'].includes(mode) ? 'domain-configured' : 'ready');
      assert.equal(await run(), ['https-pending', 'domain-pending'].includes(mode) ? 'domain-configured' : 'ready'); // Repeat reconciles without another write.
    }
    assert(calls.filter(c => c[0] === 'vercel').every(c => c[1] === 'GET'));
    assert.equal(calls.filter(c => c[0] === 'godaddy' && c[1] === 'POST').length,
      ['correct', 'conflict', 'read-exhausted'].includes(mode) ? 0 : 1);
    if (mode === 'read-transient') assert.deepEqual(delays.slice(0, 3), [1000, 2000, 1000]);
    if (mode === 'read-exhausted') assert.equal(configReads, 3);
  });
}
test('read retry is bounded and does not retry permission failures', async () => {
  const delays = []; let reads = 0;
  await assert.rejects(retryRead(async () => { reads++; throw Object.assign(Error('private'), { status: 403 }); }, async ms => delays.push(ms)));
  assert.equal(reads, 1); assert.deepEqual(delays, []);
  reads = 0;
  await assert.rejects(retryRead(async () => { reads++; throw Object.assign(Error('private'), { status: 503 }); }, async ms => delays.push(ms)));
  assert.equal(reads, 3); assert.deepEqual(delays, [1000, 2000]);
});
