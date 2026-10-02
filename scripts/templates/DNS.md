# Read-only GoDaddy DNS access check

Run from the GRIDS checkout:

```sh
npm run templates:dns-check
```

The command reads only `GODADDY_PAT` from the checkout's `.env.local` into memory.
It does not export the parsed variables into process.env, accept a token argument,
print the token, write output files, or alter the env file. A missing file/token
produces a clear error. The native env parser requires Node.js 20.12 or later.

Authentication uses a Personal Access Token in the Bearer authorization header,
as specified by GoDaddy's current [authentication documentation](https://developer.godaddy.com/en/docs/api-users/auth).
The PAT needs the `domains.domain:read` scope and access to this domain's DNS zone.

Only GET requests are made to the production endpoint:
`https://api.godaddy.com/v3/domains/zones/gridsagency.com/dns-records`.
The command requests 100 records per page and follows numeric pagination, without
following remote links or redirects. It has a 30-second timeout per request and
rejects incomplete/malformed results. See GoDaddy's
[DNS documentation](https://developer.godaddy.com/en/docs/api-users/domains/manage/dns).

After retrieving all pages, it prints TYPE, NAME, DATA/VALUE, and TTL for every
record, then explicit found/not-present checks for `www`, `admin`, `api`, and
`demo-001`. Success ends with the connection status, domain, and total record count.
An HTTP failure prints its status, selected API code/message, and troubleshooting
advice. Credential echoes and authorization headers are redacted; raw request,
response, and exception dumps are never logged.

There are no DNS/nameserver writes, Vercel calls, deployments, or changes to the
template manifest. Offline tests in `dns-check.test.cjs` use synthetic credentials
and mocked fetch; they never read the real `.env.local` or call GoDaddy.
