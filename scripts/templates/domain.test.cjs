/* eslint-disable @typescript-eslint/no-require-imports */
// Offline safety tests. No real CLIs, credentials, or network calls.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { configureDomain, domainHostname } = require('./.build/domain.js');
const { resolveTemplate } = require('./.build/manifest.js');
async function scenario(options = {}) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-domain-test-'));
  const envFile = path.join(temp, '.env.local');
  fs.writeFileSync(envFile, 'GODADDY_PAT=fixture-private-pat\n');
  const calls = [], logs = [];
  const status = { assignment: 'NOT RUN', dns: 'NOT RUN', verification: 'NOT RUN' };
  let records = options.records || [];
  const target = 'different-project.vercel-dns-099.com.';
  try {
    await configureDomain(resolveTemplate('002'), {
      projectId: 'prj_002', accountId: 'team_test', envFile, status, attempts: 2,
      sleep: async () => {}, log: value => logs.push(value),
      api: (url, method = 'GET', body) => {
        calls.push({ service: 'vercel', url, method, body });
        assert(url.includes('teamId=team_test'));
        if (url.startsWith('/v9/projects/prj_002?')) return { id: 'prj_002', name: options.wrongProject ? 'GRIDS' : 'grids-demo-002', accountId: 'team_test' };
        if (url.includes('/config?')) {
          assert(url.includes('projectIdOrName=prj_002'));
          return { recommendedCNAME: options.noTarget ? [] : [{ rank: 1, value: target }], misconfigured: !!options.pending };
        }
        if (url.includes('/verify?') && options.verifyError) throw new Error('private response');
        if (body) assert.deepEqual(body, { name: 'demo-002.gridsagency.com' });
        return { name: 'demo-002.gridsagency.com', projectId: 'prj_002', verified: !(options.pending || options.verifyError) };
      },
      fetchImpl: async (url, init) => {
        const parsed = new URL(url);
        assert.equal(parsed.origin, 'https://api.godaddy.com');
        assert.equal(parsed.pathname, '/v3/domains/zones/gridsagency.com/dns-records');
        assert.equal(init.redirect, 'error');
        assert.equal(init.headers.Authorization, 'Bearer fixture-private-pat');
        calls.push({ service: 'godaddy', url: String(url), method: init.method, body: init.body });
        if (init.method === 'GET') {
          assert.equal(parsed.searchParams.get('name'), 'demo-002');
          assert.equal(parsed.searchParams.has('type'), false);
          return Response.json({ items: records, totalItems: records.length, totalPages: 1 });
        }
        assert.equal(init.method, 'POST');
        const record = JSON.parse(init.body);
        assert.deepEqual(record, { type: 'CNAME', name: 'demo-002', data: target, ttl: 600 });
        if (options.writeFail) return Response.json({ error: 'fixture-private-pat' }, { status: 403 });
        records = [record];
        return Response.json(record, { status: 201 });
      },
    });
    return { calls, logs, status };
  } catch (error) { return { calls, logs, status, error }; }
  finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
test('assign correct project, use exact Vercel target, create and read back one record', async () => {
  const r = await scenario(); assert.ifError(r.error);
  assert.deepEqual(r.status, { assignment: 'SUCCESS', dns: 'SUCCESS', verification: 'SUCCESS' });
  assert.equal(r.calls.filter(c => c.service === 'godaddy' && c.method === 'POST').length, 1);
  assert.equal(r.calls[0].method, 'GET');
  assert(r.calls[1].url.startsWith('/v10/projects/prj_002/domains?'));
});
test('identical CNAME skips write, ignoring case and final dot', async () => {
  const r = await scenario({ records: [{ name: 'demo-002', type: 'CNAME', ttl: 600, data: 'DIFFERENT-PROJECT.vercel-dns-099.com' }] });
  assert.ifError(r.error); assert(!r.calls.some(c => c.service === 'godaddy' && c.method === 'POST'));
});
for (const record of [
  { name: 'demo-002', type: 'A', ttl: 600, data: '192.0.2.1' },
  { name: 'demo-002', type: 'CNAME', ttl: 600, data: 'old.example.com' },
  { name: 'demo-001', type: 'CNAME', ttl: 600, data: 'different-project.vercel-dns-099.com.' },
]) test('conflicting or unrelated record stops all DNS writes: ' + record.type + '/' + record.name, async () => {
  const r = await scenario({ records: [record] }); assert(r.error);
  assert.equal(r.status.assignment, 'SUCCESS'); assert.equal(r.status.dns, 'FAILED');
  assert(!r.calls.some(c => c.service === 'godaddy' && c.method === 'POST'));
});
for (const options of [{ wrongProject: true }, { noTarget: true }]) test('invalid project or missing recommendation blocks DNS', async () => {
  const r = await scenario(options); assert(r.error); assert(!r.calls.some(c => c.service === 'godaddy'));
  if (options.wrongProject) assert.equal(r.calls.length, 1);
});
for (const options of [{ pending: true }, { verifyError: true }]) test('verification timeout retains successful deployment configuration', async () => {
  const r = await scenario(options); assert.ifError(r.error);
  assert.deepEqual(r.status, { assignment: 'SUCCESS', dns: 'SUCCESS', verification: 'PENDING' });
  assert.equal(r.calls.filter(c => c.url.includes('/v9/projects/prj_002/domains/') && !c.url.includes('/verify?')).length, 3);
});
test('write failure is never retried or exposes token', async () => {
  const r = await scenario({ writeFail: true }); assert(r.error);
  assert.equal(r.calls.filter(c => c.service === 'godaddy' && c.method === 'POST').length, 1);
  assert(!String(r.error).includes('fixture-private-pat')); assert(!r.logs.join('\n').includes('fixture-private-pat'));
});
test('domain mode rejects protected and other IDs or tampered manifest mappings', () => {
  for (const id of ['001', '003', '051']) assert.throws(() => domainHostname(resolveTemplate(id)));
  for (const value of [{ customDomain: 'www.gridsagency.com' }, { vercelProjectName: 'GRIDS' }]) assert.throws(() => domainHostname({ ...resolveTemplate('002'), ...value }));
});
