/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { configureDomain, domainHostname } = require('./.build/configure-domain.js');
const { resolveTemplate } = require('./.build/manifest.js');
async function domainFixture(t, options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-bulk-domain-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const envFile = path.join(dir, '.env.local'); fs.writeFileSync(envFile, 'GODADDY_PAT=synthetic-private-pat\n');
  const template = resolveTemplate(options.id || '003'), hostname = `demo-${template.id}`, projectId = `prj_${template.id}`;
  const calls = []; let records = options.records || [], attached = !!options.attached, reads = 0;
  const target = `${hostname}.vercel-dns-099.com.`;
  const assignment = { name: template.customDomain, projectId, verified: !options.pending };
  const result = await configureDomain({ template, projectId, accountId: 'team_test', envFile, librarySetup: true, preserveExisting: true, dryRun: !!options.dryRun, attempts: 1,
    log: () => {}, status: () => {}, sleep: async () => {},
    api: async (url, method, body) => {
      calls.push(['vercel', method, url, body]); assert(url.includes('teamId=team_test'));
      if (url.startsWith(`/v9/projects/${projectId}?`)) return { id: projectId, name: template.vercelProjectName, accountId: 'team_test' };
      if (url.includes('/config?')) return { recommendedCNAME: [{ rank: 1, value: target }], misconfigured: !!options.pending };
      if (url.includes('/domains?') && method === 'GET') return { domains: attached ? [assignment] : [] };
      if (url.startsWith('/v10/projects/') && method === 'POST') { assert.deepEqual(body, { name: template.customDomain }); assert(!attached); attached = true; }
      return assignment;
    },
    fetchImpl: async (url, init) => {
      calls.push(['godaddy', init.method, String(url), init.body]);
      assert.equal(init.headers.Authorization, 'Bearer synthetic-private-pat');
      const parsed = new URL(url); assert.equal(parsed.pathname, '/v3/domains/zones/gridsagency.com/dns-records');
      if (init.method === 'GET') {
        assert.equal(parsed.searchParams.get('name'), hostname); reads++;
        if (options.race && reads === 2) records = [{ type: 'A', name: hostname, data: '192.0.2.1', ttl: 600 }];
        return Response.json({ items: records, totalPages: 1, totalItems: records.length });
      }
      assert.equal(init.method, 'POST'); assert.equal(records.length, 0);
      const record = JSON.parse(init.body); assert.deepEqual(record, { type: 'CNAME', name: hostname, data: target, ttl: 600 });
      records = [record]; return Response.json(record);
    },
  });
  return { calls, result, records };
}
test('bulk DNS guard only permits exact manifest IDs 003-051', () => {
  for (const id of ['001', '002']) assert.throws(() => domainHostname(resolveTemplate(id), true, true));
  for (const id of ['003', '051']) assert.equal(domainHostname(resolveTemplate(id), true, true), `demo-${id}`);
  for (const name of ['@', 'www', 'admin', 'api', 'demo-001', 'demo-002']) assert.throws(() => domainHostname({ ...resolveTemplate('003'), customDomain: `${name}.gridsagency.com` }, true, true));
});
test('new project gets only its exact domain and one missing CNAME', async t => {
  const f = await domainFixture(t); assert.equal(f.result, 'SUCCESS');
  assert.equal(f.calls.filter(c => c[0] === 'godaddy' && c[1] === 'POST').length, 1);
  assert.equal(f.calls.filter(c => c[0] === 'vercel' && c[1] === 'POST').length, 1);
});
test('exact CNAME and attached domain are preserved including TTL', async t => {
  const f = await domainFixture(t, { id: '051', attached: true, records: [{ type: 'CNAME', name: 'demo-051', data: 'DEMO-051.VERCEL-DNS-099.COM', ttl: 3600 }] });
  assert(f.calls.every(c => c[1] === 'GET')); assert.equal(f.records[0].ttl, 3600);
});
test('unexpected CNAME is rejected even when Vercel reports DNS working', async t => {
  await assert.rejects(domainFixture(t, { attached: true, records: [{ type: 'CNAME', name: 'demo-003', data: 'unexpected.vercel-dns.com', ttl: 600 }] }), /Unexpected existing DNS/);
});
test('a record created by another actor before POST is never overwritten', async t => {
  await assert.rejects(domainFixture(t, { race: true }), /DNS changed/);
});
test('dry-run never attaches a domain or writes missing DNS', async t => {
  const f = await domainFixture(t, { dryRun: true }); assert(f.calls.every(c => c[1] === 'GET'));
});
test('domain verification pending retains DNS and returns PENDING', async t => {
  const f = await domainFixture(t, { pending: true }); assert.equal(f.result, 'PENDING'); assert.equal(f.records.length, 1);
});
