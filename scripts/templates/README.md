# Lexington template tooling

## Permanent mapping

`manifest.ts` is the authoritative, version-controlled mapping of the 51 Lexington
base themes confirmed through authenticated GitHub discovery. Each entry explicitly
stores its ID, theme, repository, Vercel project name, and intended custom domain.
The mapping starts with `001 = aelen`, `002 = alfred`, and ends with
`051 = zeroindex`. IDs are never recalculated from GitHub order. New themes require
a reviewed manifest edit using a new unused ID; never renumber existing entries.

Manifest validation rejects duplicate IDs/repositories/projects/domains and values
outside the `Lexington-Themes/<theme>`, `grids-demo-<id>`, and
`demo-<id>.gridsagency.com` namespaces. Custom domains are metadata only. No command
assigns domains or changes DNS.

Template 001 has `existingDeployment: true`. It is already live at
`https://demo-001.gridsagency.com`. Single live commands skip it before invoking any
CLI, creating temporary directories, or changing anything. Dry runs also mark it
as protected. Existing-deployment flags can be added manually for later templates
after their deployments are verified; the scripts never rewrite the manifest.

## Discovery and reconciliation

`templates:discover` uses locally authenticated GitHub CLI credentials and ignores
shell GitHub token overrides. It requests every page of accessible repositories.
Candidate filtering still requires private repositories owned by Lexington-Themes
(case-insensitive), excludes suffixes `-emdash` and `-sanity-astro`, and excludes
`lexington-motion`.

Discovery lists permanent manifest entries as present or missing/not accessible,
and separately lists new candidate repositories without assigning IDs. A present
repository that has become public is explicitly marked ineligible. Missing means
unavailable to the authenticated account, which does not prove deletion. Discovery
does not add or change any manifest records.

## Single-template deployment and planning

`templates:deploy` requires exactly one `--id=NNN`, with optional `--dry-run`.
It resolves that ID from the manifest without dynamically enumerating themes.
A dry run prints the selected mapping and planned operations without invoking gh,
package managers, Vercel, or DNS, and without creating a deployment workspace.
Package-manager details are described conditionally because dry runs do not clone
or inspect remote source.

An explicitly requested live run of an undeployed entry verifies local gh login,
clones only its manifest repository, and prints package-manager indicators, scripts,
framework dependencies, and the Node engine. npm uses `ci`; pnpm, Bun, and Yarn 1
use `install --frozen-lockfile`; Yarn 2+ uses `install --immutable`. It requires a
single supported lockfile and honors the declared packageManager version.

Installation or local build failure stops before any Vercel command. After a
successful build, the command verifies Vercel CLI login, creates a fresh manifest
project with the CLI's authenticated API request, links only the temporary clone,
checks the new project/account IDs, and deploys with `--prod --yes`. It prints the
returned Vercel URL and stage results. An existing same-name project causes it to
stop; it never automatically deletes, modifies, or reuses an existing project.
If project creation succeeds but deployment fails, that project is retained for
manual inspection; local cleanup does not delete remote resources.

Install/build receive a restricted environment and isolated HOME, without GRIDS
application variables or CLI credentials. Environment/key files, package-manager
authentication config, source symlinks, preexisting Vercel links, and Vercel config
with environment/domain/target overrides stop deployment for review. Upload rules
exclude credentials and local tooling. The workflow never pushes or forks, changes
Lexington repositories, uses the GRIDS agency project's link, or changes
`www.gridsagency.com`, `admin.gridsagency.com`, or `api.gridsagency.com`.

## Temporary workspace cleanup

Every live run reserves a unique `.tmp/templates/<id>-<random>/` directory.
Existing `.tmp/templates/001` or other old ID directories do not block retries and
are not removed. Concurrent runs have separate local workspaces.

A `finally` block cleans only that run's directory after clone/install/build/deploy
success or failure. It verifies parent and run-directory identities before removal,
refuses replaced/symlinked paths, and never sweeps `.tmp/templates` or deletes other
runs. Child symlinks are removed without following their targets. Cleanup failure
is reported and sets a nonzero exit status. As with any process, forced termination
(e.g. SIGKILL or power loss) cannot guarantee `finally` execution; stale unique
directories still cannot block subsequent runs. `.tmp` remains gitignored and is
excluded from the application's TypeScript project.

## Bulk deployment: dry run only

The bulk command contains planning code only. It does not import live deployment
code and rejects requests without exactly `--dry-run`. It prints all 51 mappings
in permanent ID order, shows intended domains as metadata, and identifies existing
001 as protected. Live bulk deployment is not enabled.

Run the current validation step:

```sh
npm run templates:deploy-all -- --dry-run
```

## Offline verification

Compile with the standalone tooling tsconfig, then run `deploy.test.cjs` with the
Node test runner. Tests use isolated temporary fixtures and fake executables;
no real repositories or Vercel resources are created or modified. They check ID
stability, discovery reconciliation, dry-run isolation, bulk refusal, protection
of 001, package managers, failure stages, cleanup, retries, and symlink boundaries.

### Phase 2B: opt-in domain configuration (template 002 only)

First run:

```sh
npm run templates:deploy -- --id=002 --configure-domain --dry-run
```

This is offline: it prints the manifest repository, project, domain, and exact
GoDaddy hostname without loading credentials or running external commands.
After reviewing that plan, the same command without `--dry-run` deploys the
single theme, confirms the newly created project and account IDs, assigns the
manifest domain, and queries Vercel's project-specific domain configuration for
its rank-1 recommended CNAME. No target from template 001 is reused.

Normal deployment without `--configure-domain` does not assign domains or access
GoDaddy. Phase 2B domain mode currently rejects every ID except 002. Bulk live
deployment remains disabled.

GoDaddy uses the existing in-memory `.env.local` loader for `GODADDY_PAT`; the PAT
needs `domains.domain:read` and `domains.dns:update`. Credentials are never passed
to cloned builds or printed. DNS inspection filters by `name=demo-002` across all
record types and validates pagination and every returned hostname. Conflicting
records stop the workflow. An identical CNAME is accepted without a write; an
absent CNAME is rechecked, created once, then read back. No replace/delete or
whole-zone write endpoint is used. Failed writes are never automatically retried.

Verification runs at most six checks, ten seconds apart, with each Vercel request
limited to fifteen seconds. Pending propagation or verification errors retain
the deployment, assignment, and DNS and report `PENDING`; no rollback occurs.
Retry verification later using the authenticated CLI:

```sh
vercel domains verify demo-002.gridsagency.com --project grids-demo-002
```

Do not rerun deployment just to verify: the existing fresh-project guard stops
when `grids-demo-002` already exists. Additional ownership challenges requiring
TXT records are not written automatically under this CNAME-only authorization.

Offline checks:

```sh
./node_modules/.bin/tsc --project scripts/templates/tsconfig.json
node --test scripts/templates/deploy.test.cjs scripts/templates/dns-check.test.cjs scripts/templates/domain.test.cjs
```

API references: [Vercel domain assignment](https://vercel.com/docs/rest-api/projects/add-a-domain-to-a-project)
and [GoDaddy DNS v3](https://developer.godaddy.com/en/docs/api-users/domains/manage/dns).
