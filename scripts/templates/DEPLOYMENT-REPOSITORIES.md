# Template deployment repositories

Developers edit only `taeminers/grids-template-library`, which retains all 51
canonical template sources. `repository` in the manifest remains Lexington
upstream metadata. `deploymentRepository` is the GitHub repository Vercel uses:

| IDs | Deployment repository | Projects |
| --- | --- | --- |
| 001–025 | taeminers/grids-template-library | 25 |
| 026–038 | taeminers/grids-template-deploy-2 | 13 |
| 039–051 | taeminers/grids-template-deploy-3 | 13 |

IDs, ordering, themes, `libraryDirectory`, project names and domains are unchanged.
Manifest validation rejects incorrect repository assignments or missing IDs.

Single-template setup reads package/configuration files from the selected
`deploymentRepository`, verifies that repository's GitHub identity, creates or
connects the project using it, and checks production deployment provenance against
it. Bulk setup first reconciles IDs 003–051 read-only through that same implementation,
then skips externally verified READY templates and resumes missing stages sequentially.
IDs 001/002 remain protected account anchors. Existing single-template protections for 001/002 and ready
checkpoints remain in place.

Historical failed mirror entries remain failed until an explicit setup succeeds;
they are eligible for retry. Loading the new manifest or running a dry run does
not promote checkpoints to ready. Existing project/account/source identity checks
still apply: a project already linked to a different repository is not silently
reconnected. The Vercel GitHub App must have access to the relevant private mirror.

For the next read-only inspection, run only:

```sh
npm run templates:setup-vercel -- --id=026 --dry-run
```

This single-template dry run performs authenticated inspection but no remote
writes or checkpoint writes. Bulk dry run remains an offline manifest/state plan.

## Resume a partial single-template setup

The explicit single-template execute command inspects external state again, uses
the current Vercel CNAME recommendation, and preserves a correct existing project,
Git connection, active Git-source production deployment and domain attachment.
It queries only the selected GoDaddy hostname, creates a CNAME only when absent,
and refuses conflicting records. Successful DNS writes are read back before
bounded domain verification and HTTPS polling (six checks each, ten-second gaps).

Transient Vercel/GoDaddy reads retry at most three times, with one- and two-second
backoff. Permission, identity and DNS conflicts are not retried. Writes are never
retried by the read helper. After a failed domain attachment or DNS create,
readback can confirm success despite a lost response; unconfirmed results stop
and remain eligible for reconciliation on the next explicit run. No rollback,
record replacement, or deletion is performed.
