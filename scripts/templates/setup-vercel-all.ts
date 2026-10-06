// Sequential orchestration only. All remote setup lives in setup-vercel.ts.
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { loadManifest } from "./manifest";
import { verifyGitHubCli } from "./shared";
import { Dependencies, mainDependencies, resolveSetupAccount, setup } from "./setup-vercel";
import { SetupError, SetupPersistenceError, SetupState, protectedId, loadSetupState, saveSetupState, acquireLock, setupErrorMessage } from "./setup-state";
export interface BulkOptions { execute: boolean; scope?: string }
export function parseBulkArgs(args: string[]): BulkOptions {
  let mode: string | undefined, scope: string | undefined;
  for (const arg of args) {
    if (arg === "--execute" || arg === "--dry-run") { if (mode) throw new SetupError("Choose exactly one of --dry-run or --execute."); mode = arg; }
    else if (/^--scope=[a-zA-Z0-9_-]+$/.test(arg) && scope === undefined) scope = arg.slice(8);
    else throw new SetupError("Unknown or duplicate bulk argument. Use --dry-run or --execute (optional --scope=team-slug).");
  }
  if (!mode) throw new SetupError("Bulk setup refuses to run without --dry-run or --execute.");
  return { execute: mode === "--execute", scope };
}
export function printBulkPlan(state: SetupState, log: (message: string) => void): void {
  log("GRIDS TEMPLATE LIBRARY SETUP DRY RUN\nCanonical development source: taeminers/grids-template-library\nProduction branch: main\nOffline manifest/state plan: zero external requests or changes.\n");
  for (const t of loadManifest()) {
    const entry = state.templates.find(e => e.id === t.id)!;
    const reported = ["001", "002", "003", "026"].includes(t.id) ? "User-confirmed READY; inspect without writes" : "External status not inspected in offline dry run";
    const action = protectedId(t.id) ? "SKIP protected anchor; verify account/Git identity" :
      "READ-ONLY RECONCILE (HTTPS first); SKIP if verified READY, otherwise resume missing stages using shared single-template setup";
    log(`${t.id} — ${t.theme}\n  Current checkpoint: ${entry.status}\n  Reconciliation: ${reported}\n  Deployment Git Repository: ${t.deploymentRepository}\n  Root Directory: ${t.libraryDirectory}\n  Vercel project: ${t.vercelProjectName}\n  Custom domain: ${t.customDomain}\n  Planned action: ${action}`);
  }
  log(`\nTotal: ${state.templates.length}; sequential read-only reconciliation precedes setup writes.`);
}
export interface BulkSummary { alreadyReady: number; newlyReady: number; httpsPending: string[]; pending: string[]; failed: string[]; total: number }
export async function runBulk(options: BulkOptions, deps: Dependencies, statePath: string): Promise<BulkSummary> {
  // Both entrypoints share this lock and state file. CLI dry-run never constructs
  // dependencies, and tests can prove even this function performs no requests.
  if (!options.execute) {
    const state = loadSetupState(statePath); printBulkPlan(state, deps.log);
    return { alreadyReady: state.templates.filter(e => e.status === "ready").length, newlyReady: 0, httpsPending: [], pending: [], failed: [], total: state.templates.length };
  }
  mkdirSync(dirname(statePath), { recursive: true });
  const release = acquireLock(`${statePath}.lock`);
  try {
    const state = loadSetupState(statePath);
    const summary: BulkSummary = { alreadyReady: 2, newlyReady: 0, httpsPending: [], pending: [], failed: [], total: state.templates.length };
    // Bootstrap account/team using GET only. Never inspect or mutate protected
    // domains, DNS, deployments or settings beyond these identity reads.
    const accountId = await resolveSetupAccount(deps);
    if (state.accountId && state.accountId !== accountId) throw new SetupError("Saved setup account differs from verified 001/002 anchors; batch stopped before changes.");
    state.accountId = accountId;
    const persist = () => saveSetupState(statePath, state);
    persist();
    const resume: string[] = [];
    // Finish read-only reconciliation for every selected template before any
    // provider writes. A failed inspection is isolated and never licenses writes.
    for (const t of loadManifest()) {
      const entry = state.templates.find(e => e.id === t.id)!;
      if (protectedId(t.id)) { deps.log(`${t.id} SKIP — verified protected anchor`); continue; }
      try {
        const inspected = structuredClone(entry);
        // Stale deployment checkpoints must not determine read-only readiness.
        delete inspected.deploymentId; delete inspected.deploymentUrl;
        delete inspected.deploymentRequestedAt; delete inspected.needsDeployment;
        const result = await setup({ id: t.id, execute: false, reconcileOnly: true, accountId, entry: inspected }, deps);
        if (result === "ready") {
          Object.assign(entry, inspected, { updatedAt: new Date().toISOString() });
          summary.alreadyReady++; deps.log(`${t.id} SKIP — reconciled READY`);
        } else {
          // READY is a historical checkpoint, not permission to skip inspection.
          if (entry.status === "ready") entry.status = "pending";
          resume.push(t.id);
        }
        persist();
      } catch (error) {
        if (error instanceof SetupPersistenceError) throw error;
        entry.status = "failed"; entry.lastError = setupErrorMessage(error); entry.updatedAt = new Date().toISOString();
        persist(); summary.failed.push(t.id); deps.log(`${t.id} RECONCILIATION FAILED — ${entry.lastError}`);
      }
    }
    for (const id of resume) {
      const t = loadManifest().find(t => t.id === id)!;
      const entry = state.templates.find(e => e.id === id)!;
      deps.log(`\n[${t.id}/051] ${t.theme}`);
      entry.lastError = null;
      try {
        const result = await setup({ id: t.id, execute: true, scope: options.scope, accountId, entry,
          checkpoint: (status, stage) => {
            entry.status = status;
            if (stage) { entry.lastSuccessfulStage = stage; entry.lastError = null; }
            entry.updatedAt = new Date().toISOString(); persist();
          },
        }, deps);
        if (result === "ready") summary.newlyReady++;
        else if (result === "domain-configured") summary.httpsPending.push(t.id);
        else summary.pending.push(t.id);
        entry.updatedAt = new Date().toISOString(); persist();
      } catch (error) {
        if (error instanceof SetupPersistenceError) throw error;
        entry.status = "failed"; entry.lastError = setupErrorMessage(error); entry.updatedAt = new Date().toISOString();
        // A checkpoint write failure aborts rather than continuing without a
        // resumable record. Provider/template failures are isolated below.
        persist(); summary.failed.push(t.id);
        deps.log(`${t.id} FAILED — ${entry.lastError}`);
      }
    }
    deps.log(`\nGRIDS TEMPLATE LIBRARY SETUP COMPLETE\n\nAlready ready:   ${summary.alreadyReady}\nNewly ready:     ${summary.newlyReady}\nHTTPS pending:   ${summary.httpsPending.length}\nFailed:          ${summary.failed.length}\nTotal:           ${summary.total}`);
    if (summary.pending.length) deps.log(`Build/other pending: ${summary.pending.length}`);
    for (const id of [...summary.httpsPending, ...summary.pending, ...summary.failed]) {
      const entry = state.templates.find(e => e.id === id)!;
      deps.log(`${id} ${entry.status.toUpperCase()} — ${entry.lastError ?? "Production build still provisioning; inspect and resume."}`);
    }
    deps.log(`Failed IDs: ${summary.failed.length ? summary.failed.join(", ") : "none"}`);
    return summary;
  } finally { release(); }
}
if (require.main === module) {
  (async () => {
    const options = parseBulkArgs(process.argv.slice(2));
    const statePath = resolve(__dirname, "../../../.tmp/templates-setup-state.json");
    // Planning needs neither CLI credentials nor network and writes no state.
    if (!options.execute) { printBulkPlan(loadSetupState(statePath), console.log); return; }
    verifyGitHubCli();
    const summary = await runBulk(options, mainDependencies(options), statePath);
    if (summary.failed.length) process.exitCode = 1;
  })().catch((error: unknown) => { console.error(setupErrorMessage(error)); process.exitCode = 1; });
}
