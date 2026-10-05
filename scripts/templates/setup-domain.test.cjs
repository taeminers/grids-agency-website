/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { configureDomain } = require('./.build/configure-domain.js');
const { resolveTemplate } = require('./.build/manifest.js');
async function scenario({ dryRun = true, missing = false, conflict = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-setup-dns-'));
  const envFile = path.join(dir, '.env.local'); fs.writeFileSync(envFile, 'GODADDY_PAT=synthetic-token\n');
  const calls = [];
  try {
    await configureDomain({ template: resolveTemplate('002'), projectId: 'prj_002', accountId: 'team_test', envFile, preserveExisting: true, dryRun,
      log: () => {}, status: () => {}, sleep: async () => {},
      api: async (url, method) => {
        calls.push(['vercel', method, url]);
        if (url.startsWith('/v9/projects/prj_002?')) return { id: 'prj_002', accountId: 'team_test', name: 'grids-demo-002' };
        if (url.includes('/config?')) return { recommendedCNAME: [{ rank: 1, value: 'new.vercel-dns.com' }], misconfigured: missing || conflict };
        if (url.includes('/domains?')) return { domains: [{ name: 'demo-002.gridsagency.com' }] };
        return { name: 'demo-002.gridsagency.com', projectId: 'prj_002', verified: true };
      },
      fetchImpl: async (_, init) => {
        calls.push(['godaddy', init.method]);
        return Response.json({ items: missing ? [] : [{ name: 'demo-002', type: conflict ? 'A' : 'CNAME', data: conflict ? '192.0.2.1' : 'old-working.vercel-dns.com', ttl: 3600 }], totalPages: 1, totalItems: missing ? 0 : 1 });
      },
    });
    return calls;
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
test('working existing DNS and domain preserved even when recommendation changes', async () => {
  const calls = await scenario({ dryRun: false }); assert(calls.every(c => c[1] === 'GET'));
});
test('dry run missing DNS never writes', async () => {
  const calls = await scenario({ missing: true }); assert(calls.every(c => c[1] === 'GET'));
});
test('conflicting existing DNS fails without writes', async () => {
  await assert.rejects(scenario({ conflict: true }), /Unexpected existing DNS/);
});
