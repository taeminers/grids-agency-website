// Offline only: synthetic tokens, isolated env fixtures, and mocked fetch.
/* eslint-disable @typescript-eslint/no-require-imports -- This Node CommonJS harness loads compiled CommonJS tooling. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { dnsCheck } = require('./.build/dns-check.js');
const fakeToken = 'synthetic-pat-for-offline-tests';

async function check(bodyOrFetch, content = `GODADDY_PAT="${fakeToken}"\n`) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-dns-test-'));
  const envFile = path.join(directory, '.env.local');
  if (content !== null) fs.writeFileSync(envFile, content, { mode: 0o600 });
  const messages = [], requests = [];
  let error;
  const beforeEnv = { ...process.env };
  try {
    await dnsCheck({
      envFile,
      log: message => messages.push(message),
      fetchImpl: async (input, options) => {
        const url = new URL(String(input));
        requests.push({ url, options });
        assert.equal(url.origin, 'https://api.godaddy.com');
        assert.equal(url.pathname, '/v3/domains/zones/gridsagency.com/dns-records');
        assert.equal(url.searchParams.get('pageSize'), '100');
        assert.equal(url.searchParams.get('totalRequired'), 'true');
        assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
        assert.equal(options.headers.Authorization, 'Bearer ' + fakeToken);
        assert.equal(options.headers.Accept, 'application/json');
        assert(options.signal instanceof AbortSignal); assert.equal(options.body, undefined);
        return typeof bodyOrFetch === 'function' ? bodyOrFetch(url, options) : Response.json(bodyOrFetch);
      },
    });
  } catch (failure) { error = failure; }
  finally {
    assert.deepEqual({ ...process.env }, beforeEnv, 'must not populate global environment');
    assert.equal(fs.readdirSync(directory).length, content === null ? 0 : 1, 'must not persist output or credentials');
    if (content !== null) assert.equal(fs.readFileSync(envFile, 'utf8'), content, 'must not modify .env.local');
    fs.rmSync(directory, { recursive: true, force: true });
  }
  const output = messages.join('\n') + (error?.message ?? '');
  assert(!output.includes(fakeToken), 'must redact the PAT everywhere');
  assert(!output.includes('Authorization: Bearer'), 'must never print auth headers');
  return { messages, requests, error, output };
}
const record = (name, type = 'CNAME', data = 'cname.vercel-dns.com', ttl = 600) => ({ name, type, data, ttl });

test('uses PAT Bearer auth and prints records plus all four requested confirmations', async () => {
  const result = await check({ items: [record('www'), record('admin'), record('api'), record('demo-001')], totalItems: 4, totalPages: 1 });
  assert.equal(result.error, undefined); assert.equal(result.requests.length, 1);
  assert.match(result.output, /TYPE\s+NAME\s+DATA\/VALUE\s+TTL/);
  for (const name of ['www', 'admin', 'api', 'demo-001']) assert(result.output.includes(name + ': FOUND (1 record)'));
  assert.match(result.output, /GoDaddy API: CONNECTED\nDomain: gridsagency.com\nDNS records: 4/);
});
test('empty zone reports zero records and missing names without creating them', async () => {
  const result = await check({ items: [] }); assert.equal(result.error, undefined);
  assert.match(result.output, /DNS records: 0/);
  for (const name of ['www', 'admin', 'api', 'demo-001']) assert(result.output.includes(name + ': NOT PRESENT'));
});
test('loads quoted/exported PAT from local file with comments', async () => {
  const result = await check({ items: [] }, `# local fixture\nexport GODADDY_PAT='${fakeToken}' # comment\nUNRELATED=never-export\n`);
  assert.equal(result.error, undefined); assert.equal(result.requests.length, 1);
});
for (const content of [null, '', 'OTHER=value\n', 'GODADDY_PAT=\n', 'GODADDY_PAT=" "\n']) {
  test('missing token/env file refuses all network calls: ' + JSON.stringify(content), async () => {
    const result = await check({ items: [] }, content);
    assert(result.error); assert.equal(result.requests.length, 0); assert.match(result.output, /GODADDY_PAT/);
  });
}
test('invalid token whitespace fails without exposing the value', async () => {
  const result = await check({ items: [] }, `GODADDY_PAT="${fakeToken} extra"`);
  assert(result.error); assert.equal(result.requests.length, 0);
});
test('fetches all pages before printing connected and recognizes FQDN labels', async () => {
  const result = await check(url => {
    const page = Number(url.searchParams.get('page'));
    return Response.json({ items: page === 1 ? [record('www')] : [record('ADMIN.GRIDSAGENCY.COM.')], totalItems: 2, totalPages: 2 });
  });
  assert.equal(result.error, undefined); assert.deepEqual(result.requests.map(r => r.url.searchParams.get('page')), ['1', '2']);
  assert.match(result.output, /admin: FOUND/); assert.match(result.output, /DNS records: 2/);
});
test('never follows next link to another host or endpoint', async () => {
  const result = await check(url => Number(url.searchParams.get('page')) === 1
    ? Response.json({ items: [record('www')], links: [{ rel: 'next', href: 'https://attacker.invalid/steal' }] })
    : Response.json({ items: [record('api')], links: [] }));
  assert.equal(result.error, undefined); assert.equal(result.requests.length, 2); assert.match(result.output, /DNS records: 2/);
});
for (const status of [401, 403, 404, 429, 500]) {
  test('HTTP ' + status + ' prints useful error and redacts echoed authorization/token', async () => {
    const result = await check(() => Response.json({ code: 'API_TEST_ERROR', message: `Access denied ${fakeToken}; Authorization: Bearer ${fakeToken}`, headers: { Authorization: 'Bearer ' + fakeToken } }, { status }));
    assert(result.error); assert.match(result.output, new RegExp('HTTP ' + status));
    assert.match(result.output, /API_TEST_ERROR: Access denied/); assert.equal(result.messages.length, 0);
    assert(!result.output.includes('CONNECTED'));
  });
}
test('plain-text HTTP error does not dump possibly sensitive raw body', async () => {
  const result = await check(() => new Response('upstream error ' + fakeToken, { status: 502 }));
  assert(result.error); assert.match(result.output, /HTTP 502/); assert.match(result.output, /not readable JSON/);
});
test('network exception containing token is never propagated', async () => {
  const result = await check(() => { throw new Error('Authorization: Bearer ' + fakeToken); });
  assert(result.error); assert.match(result.output, /failed or timed out/);
});
test('later-page failure never prints a misleading partial connected summary', async () => {
  const result = await check(url => Number(url.searchParams.get('page')) === 1
    ? Response.json({ items: [record('www')], totalPages: 2 })
    : Response.json({ code: 'FORBIDDEN', message: 'Scope missing' }, { status: 403 }));
  assert(result.error); assert.equal(result.requests.length, 2); assert.equal(result.messages.length, 0);
});
for (const body of [{ records: [] }, { items: [{ name: 'www', type: 'CNAME', data: fakeToken, ttl: '600' }] }, { items: [], totalPages: -1 }, { items: [record('www')], totalItems: 10, totalPages: 1 }]) {
  test('malformed or incomplete response refuses success: ' + Object.keys(body).join(','), async () => {
    const result = await check(body); assert(result.error); assert.equal(result.messages.length, 0);
  });
}
test('record values redact token and escape terminal control characters', async () => {
  const result = await check({ items: [record('txt', 'TXT', fakeToken + '\n\x1b[31m')] });
  assert.equal(result.error, undefined); assert.match(result.output, /REDACTED/); assert(!result.output.includes('\x1b'));
  assert.match(result.output, /\\u000a\\u001b/);
});
