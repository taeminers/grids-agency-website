# Permanent Git-connected Vercel setup

The canonical production source is the private
`taeminers/grids-template-library` repository. Lexington repositories are upstream
sources only. IDs, themes, root directories, project names and domains come from
`manifest.ts`; its `repository` field retains upstream discovery/import metadata.
001 and 002 have both been verified with automatic Git push redeployment and
working domain/DNS/HTTPS. They are always skipped by the new setup entrypoints.

## Bulk plan and execution

The next operator step is **only**:

```sh
npm run templates:setup-vercel-all -- --dry-run
```

Bulk dry-run is an offline manifest/state plan. It makes no external requests,
loads no credentials, and neither initializes nor changes a state file. It prints
every ID/theme, checkpoint, reported verification, deployment repository, root,
project, domain and planned action. Historical READY checkpoints are rechecked
read-only before execution; they are not assumed to reflect current external state. Live existence/build/DNS checks
are deliberately deferred to execution. Running without exactly one mode flag
refuses before any provider access.

The implemented `--execute` mode processes 003–051 **sequentially**, with no
concurrency. It first performs a read-only reconciliation pass (HTTPS first),
then resumes missing stages. Verified READY templates are skipped without writes.
It uses the same `setup()` function as the single-template command:

```sh
npm run templates:setup-vercel -- --id=003 --dry-run
```

Single-template dry-run performs read-only live inspection for that ID. Bulk and
single execution share the same lock/checkpoints. Optional `--scope=team-slug`
selects CLI scope; otherwise locally configured CLI scope is used.

Execution requires Node 20.12+, authenticated `gh` and Vercel CLI (command surface
verified with 62.1.0), Vercel GitHub App access to the private library, and the
existing `.env.local` `GODADDY_PAT`. A local PAT preflight happens before mutation.
No credentials are copied into state, request files, CLI arguments or build
processes. Private provider bodies are suppressed; failures store locally authored
messages and HTTP status/recognized public error codes only.

## Shared per-template workflow

The implementation extends the proven 002 workflow rather than creating a second
remote implementation. It:

1. Uses GET-only inspection of 001/002 to verify their identity, canonical Git
   source, root and `main` branch, and pins their common account/team. A mismatch
   stops the batch before changes. No protected domain/DNS/deployment operations
   occur. Single 001/002 also skip without invoking provider dependencies.
2. Verifies the library directory/package.json on `main`, detects Astro/Next.js/
   Vite and checks source vercel.json for disabled/ignored Git builds.
3. Looks up the exact manifest project in the pinned account. Only a documented
   HTTP 404 permits creation; permission/network/unknown failures do not.
   Rechecks absence before POST `/v11/projects`, never retries that POST blindly,
   and recovers a lost/conflicting response by exact GET. Saved projects that
   disappear or change identity are never silently replaced.
4. PATCHes the existing/new project by immutable ID with the manifest Root
   Directory and detected framework. Build/install/output overrides are reset to
   Vercel detection and the Ignored Build Step is cleared, as in the working 002
   implementation. Source vercel.json can still override these defaults.
5. Calls supported `vercel git connect` for only
   `https://github.com/taeminers/grids-template-library.git` in an isolated temporary
   CLI context containing the verified project/account IDs. No template clone,
   source upload, upstream deployment or code push occurs. Foreign Git links stop
   without disconnecting or replacing them.
6. Re-reads the persistent link and requires exact org/repo/repoId, root/build
   settings and production branch `main`. Vercel's public project-update schema
   has no production-branch field; connection uses normal default-main branch
   selection. If verification finds another branch, that template fails with
   instructions to set Production Branch in Project Settings → Environments →
   Production. No undocumented branch API is used.
7. Creates or resumes a production deployment with the verified project ID and
   `gitSource: { type: "github", repoId, ref: "main" }`. It verifies source, project
   and target, polls up to approximately 10 minutes for READY, and checks that the
   deployment is the active production target. Existing valid production is
   reused when settings match.
8. Reuses `configure-domain.ts` to attach only the exact manifest domain, ask
   Vercel for its project-specific preferred CNAME, and inspect GoDaddy for only
   the exact `demo-XXX` hostname. A unique exact CNAME is preserved with its TTL;
   conflicts/duplicates fail without replacing, overwriting or deleting anything.
   A missing record is re-read immediately before one create and read back after.
9. Separately checks domain/DNS verification and HTTPS. HTTPS uses the proven
   six-attempt readiness check, up to 50 seconds of retry delays plus bounded
   HTTP request time. Pending domain verification or TLS retains the deployment,
   domain and DNS for resume, with no rollback.

The persistent Git link enables future pushes to trigger deployments; the initial
Git-source deployment is not a substitute for that connection. Account/repository
plan limits or GitHub App access errors are reported for individual templates.

## Resume and state

Setup state is stored in the git-ignored
`.tmp/templates-setup-state.json`, separate from historical clone deployment state.
The first execute run initializes 001/002 as READY and 003–051 as pending. Dry-run
uses this initial state in memory if no file exists.

State records manifest identity, project/account/deployment IDs, deployment URL,
status, last successful stage, sanitized error, update time and request markers.
Checkpoints are validated against the manifest and saved using a private temporary
file, fsync, atomic rename and parent-directory fsync. A shared process lock
prevents simultaneous single/bulk execution. A dead-process lock is reclaimable;
invalid state/locks are not silently discarded. State write failures stop the batch.

READY entries are skipped. Partial/failed entries are inspected and resumed from
actual provider configuration; settings, existing domains, DNS and deployments are
preserved where correct. HTTPS-pending entries reuse the saved production deployment
and recheck readiness before any new deployment. A root/build change records a
new-deployment requirement before PATCH so an interrupted run cannot incorrectly
reuse an older build after settings changed.

Deployment request intent is saved before POST and its ID immediately afterward.
An uncertain/lost response is reconciled against recent matching deployments. If
no matching outcome can be confirmed, that template fails safely with reconciliation
instructions rather than blindly submitting another deployment. Confirmed failed
builds may be retried on a later run. Never delete the checkpoint file just to retry
an uncertain request; inspect the retained Vercel state first.

A provider/template failure records the ID/error and continues to the next ID.
Final output lists already/newly READY counts, pending readiness, failures, all 51
templates and pending/failed IDs with errors. A batch with failed IDs exits nonzero;
readiness-pending templates remain resumable without rollback.

## Offline validation

```sh
npx tsc --project scripts/templates/tsconfig.json
node --test scripts/templates/setup-vercel.test.cjs scripts/templates/setup-vercel-all.test.cjs scripts/templates/setup-bulk-domain.test.cjs scripts/templates/setup-domain.test.cjs scripts/templates/domain.test.cjs
```

Tests use synthetic GitHub/Vercel/GoDaddy/HTTPS providers and fake CLIs only. They
cover sequential processing, protected IDs, project/account checks, exact DNS,
conflicts, failure isolation, atomic state, locking, uncertain deployment requests
and HTTPS resume without redeployment.

Supported mechanisms: [Vercel Git CLI](https://vercel.com/docs/cli/git),
[project creation API](https://vercel.com/docs/rest-api/projects/create-a-new-project),
[project update schema](https://github.com/vercel/sdk/blob/main/docs/models/updateprojectrequestbody.md),
[Git branch selection](https://vercel.com/docs/git), and
[deployment API](https://vercel.com/docs/rest-api/reference/endpoints/deployments/create-a-new-deployment).

## Historical clone deployment tooling

The commands below describe the earlier Lexington clone workflow. They are not
canonical production setup commands and must not be used for production demos.
Use the permanent Git setup command above for the 002 proof.

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
`demo-<id>.gridsagency.com` namespaces. Custom domains remain metadata unless
`--configure-domain` is explicitly requested for the Phase 2B test template 002.

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

`templates:deploy` requires exactly one `--id=NNN`, with optional `--dry-run`
and `--configure-domain` (002 only).
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
vercel domains inspect demo-002.gridsagency.com
```

Do not rerun deployment just to verify: the existing fresh-project guard stops
when `grids-demo-002` already exists. Additional ownership challenges requiring
TXT records are not written automatically under this CNAME-only authorization.

Offline checks:

```sh
./node_modules/.bin/tsc --project scripts/templates/tsconfig.json
node --test scripts/templates/deploy.test.cjs scripts/templates/dns-check.test.cjs scripts/templates/domain.test.cjs
```

API references: [Vercel domain assignment](https://vercel.com/docs/rest-api/projects/add-a-domain-to-a-project),
[Vercel DNS recommendations](https://vercel.com/docs/rest-api/domains/get-a-domain-s-configuration),
and [GoDaddy DNS v3](https://developer.godaddy.com/en/docs/api-users/domains/manage/dns).

## New-project setup and template 003 retry

A scoped GET of the manifest project returning HTTP 404 reports
`PROJECT_NOT_FOUND`. Authentication, permission and network errors never authorize
creation. Execution repeats that GET, then submits one `POST /v11/projects` with
`teamId` from the verified protected anchors, the manifest name/root, detected
framework, automatic build/install/output settings, and
`gitRepository: { type: "github", repo: "taeminers/grids-template-library" }`.
This creates a persistent Git integration using the supported
[Vercel project creation API](https://vercel.com/docs/rest-api/projects/create-a-new-project).
The repository default branch is required to be `main`; the saved Git production
branch must also read back as `main` before any deployment request.

A fresh GET must verify project name/ID/account, Git repository/ID, production
branch, root and build settings before the existing deployment/domain/DNS/HTTPS
workflow proceeds. The existing-project PATCH/Git-connect workflow is retained.
A failed entry without a saved project ID can be rerun; a saved project that has
since disappeared is never silently recreated. A lost creation response is
reconciled by GET only, without repeating the creation POST.

API requests now use REST with the existing Vercel CLI login held in memory;
tokens never appear in arguments/output. Requests do not follow redirects or
retry automatically. This avoids CLI-internal API retries and preserves the
actual HTTP status of errors. An expired CLI login requires a separate login.
Failures report `PROJECT_CREATE_FAILED`, `GIT_CONNECT_FAILED`,
`PROJECT_CONFIG_FAILED`, or `DEPLOYMENT_FAILED`, with available HTTP status and
sanitized details. Diagnostic mode still permits only GET requests.

For the template 003 operator retry, run only:

```sh
npm run templates:setup-vercel -- --id=003 --execute
```

Focused offline validation (synthetic template 003 providers only):

```sh
npx tsc --project scripts/templates/tsconfig.json
node --test scripts/templates/setup-new-project.test.cjs scripts/templates/setup-vercel.test.cjs scripts/templates/setup-diagnose.test.cjs
```
