// Shared permanent Git setup used by the single-template and sequential bulk commands.
import { retryRead } from "./read-retry";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { gh, verifyGitHubCli } from "./shared";
import { resolveTemplate, Template } from "./manifest";
import { VercelApiError, VercelOperationError, operationForRequest, cliErrorDescription } from "./vercel-errors";
export { VercelApiError } from "./vercel-errors";
import { authenticatedRest } from "./vercel-rest";
import { diagnoseTemplate } from "./setup-diagnose";
import { loadToken } from "./godaddy";
import { configureDomain } from "./configure-domain";
import { SetupEntry, SetupStatus, SetupError, setupErrorMessage, protectedId, loadSetupState, saveSetupState, acquireLock } from "./setup-state";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Checked API JSON may contain provider-specific fields.
type Json = Record<string, any>; // External JSON is checked at trust boundaries below.
type Method = "GET" | "POST" | "PATCH";
export interface SetupOptions {
  id: string; execute: boolean; reconcileOnly?: boolean; diagnose?: boolean; scope?: string; accountId?: string;
  entry?: SetupEntry; checkpoint?: (status: SetupStatus, stage?: string) => void;
}
export type SetupResult = "ready" | "domain-configured" | "deploying" | "planned" | "skipped";
const scopePath = (path: string, accountId?: string) => accountId?.startsWith("team_")
  ? `${path}${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(accountId)}` : path;

export interface Dependencies {
  api(path: string, method?: Method, body?: object): Promise<Json>;
  github(path: string): Json;
  connect(projectId: string, accountId: string, deploymentRepository: string): void;
  domain(template: Template, projectId: string, accountId: string, dryRun: boolean): Promise<unknown>;
  https(domain: string): Promise<boolean>;
  sleep(ms: number): Promise<void>;
  log(message: string): void;
}
export function parseArgs(args: string[]): SetupOptions {
  let id = "", mode = "", scope: string | undefined;
  const seen = new Set<string>();
  for (const arg of args) {
    const key = arg.split("=")[0];
    if (seen.has(key)) throw new SetupError("Duplicate argument.");
    seen.add(key);
    if (/^--id=\d{3}$/.test(arg)) id = arg.slice(5);
    else if (arg === "--dry-run" || arg === "--execute" || arg === "--diagnose") {
      if (mode) throw new SetupError("Choose exactly one of --dry-run, --execute or --diagnose.");
      mode = arg;
    } else if (/^--scope=[a-zA-Z0-9_-]+$/.test(arg)) scope = arg.slice(8);
    else throw new SetupError("Unknown argument; use --id=003 --dry-run (optional --scope=team-slug).");
  }
  if (!id || !mode) throw new SetupError("Require a manifest --id=XXX and exactly one mode: --dry-run, --execute or --diagnose.");
  resolveTemplate(id);
  if (mode === "--diagnose" && id !== "003") throw new SetupError("Diagnostic mode is enabled ONLY for template 003.");
  return { id, execute: mode === "--execute", ...(mode === "--diagnose" ? { diagnose: true } : {}), scope };
}
function assertProject(project: Json, template: Template, identity?: Json): void {
  if (!project || !/^prj_[a-zA-Z0-9_-]+$/.test(project.id) || project.name !== template.vercelProjectName ||
      !/^[a-zA-Z0-9_-]+$/.test(project.accountId) ||
      (identity && (project.id !== identity.id || project.accountId !== identity.accountId))) {
    throw new SetupError("Project identity mismatch. Refusing all further operations.");
  }
}
function correctLink(link: Json | undefined, repoId: number, deploymentRepository: string): boolean {
  return !!link && link.type === "github" && link.org === deploymentRepository.split("/")[0] && link.repo === deploymentRepository.split("/")[1] && String(link.repoId) === String(repoId);
}
export async function setup(options: SetupOptions, deps: Dependencies): Promise<SetupResult> {
  if (protectedId(options.id)) { deps.log(`${options.id} SKIP — already configured`); return "skipped"; }
  const template = resolveTemplate(options.id);
  const deploymentRepository = template.deploymentRepository;
  const [gitOwner, gitName] = deploymentRepository.split("/");
  const { log } = deps;
  const api: Dependencies["api"] = (path, method = "GET", body) => method === "GET"
    ? retryRead(() => deps.api(path, method, body), deps.sleep) : deps.api(path, method, body);
  const checkpoint = (status: SetupStatus, stage?: string) => { if (options.execute) options.checkpoint?.(status, stage); };
  const progress = (stage: string) => log(`${stage.padEnd(20)}✓`);
  const entry = options.entry;
  const httpsFirst = options.reconcileOnly ? await deps.https(template.customDomain) : undefined;
  const expectedAccount = options.accountId ?? await resolveSetupAccount(deps);
  if (entry?.accountId && entry.accountId !== expectedAccount) throw new SetupError("Saved project belongs to another account; refusing to continue.");
  log(`${options.execute ? "EXECUTE" : "READ-ONLY DRY RUN"}: ${template.id} / ${template.theme}\nDeployment Git Repository: ${deploymentRepository}\nRoot Directory: ${template.libraryDirectory}\nProject: ${template.vercelProjectName}\nDomain: ${template.customDomain}\nProduction branch: main`);
  const repo = deps.github(`/repos/${deploymentRepository}`);
  if (repo.full_name !== deploymentRepository || !Number.isSafeInteger(repo.id) || repo.default_branch !== "main") {
    throw new SetupError("Permanent GitHub repository identity/default branch must be verified as main.");
  }
  const pkgFile = deps.github(`/repos/${deploymentRepository}/contents/${template.libraryDirectory}/package.json?ref=main`);
  if (pkgFile.type !== "file" || pkgFile.encoding !== "base64" || typeof pkgFile.content !== "string") throw new SetupError("Library package.json is missing or invalid.");
  const pkg = JSON.parse(Buffer.from(pkgFile.content, "base64").toString("utf8"));
  const packages = { ...pkg.dependencies, ...pkg.devDependencies };
  const framework = packages.astro ? "astro" : packages.next ? "nextjs" : packages.vite ? "vite" : undefined;
  if (!framework || typeof pkg.scripts?.build !== "string") throw new SetupError("Unrecognized framework/build configuration; manual review required before setup.");
  const contents = deps.github(`/repos/${deploymentRepository}/contents/${template.libraryDirectory}?ref=main`);
  if (!Array.isArray(contents)) throw new SetupError("Unable to inspect library directory configuration.");
  if (contents.some((entry: Json) => entry.name === "vercel.json")) {
    const file = deps.github(`/repos/${deploymentRepository}/contents/${template.libraryDirectory}/vercel.json?ref=main`);
    if (file.encoding !== "base64" || typeof file.content !== "string") throw new SetupError("Invalid library Vercel configuration.");
    const config = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
    const enabled = config.git?.deploymentEnabled;
    if (enabled === false || enabled?.main === false || (enabled?.["*"] === false && enabled?.main !== true) || config.github?.enabled === false || config.ignoreCommand) {
      throw new SetupError("Library vercel.json disables or may skip Git builds. Review it before setup.");
    }
  }
  const settings = { rootDirectory: template.libraryDirectory, framework, buildCommand: null, installCommand: null, outputDirectory: null, commandForIgnoringBuildStep: null };
  const operation = async <T>(name: string, task: () => Promise<T>): Promise<T> => {
    try { return await task(); } catch (error) {
      if (error instanceof VercelOperationError && error.operation === name) throw error;
      throw new VercelOperationError(name, error instanceof SetupError ? error.message : "Operation failed; private provider output suppressed. No automatic write retry.", error instanceof VercelOperationError ? error.status : undefined);
    }
  };
  const scoped = (path: string) => scopePath(path, expectedAccount);
  const lookup = async () => {
    try { return await api(scoped(`/v9/projects/${template.vercelProjectName}`)); }
    catch (error) { if (error instanceof VercelApiError && error.status === 404) { log(`PROJECT_NOT_FOUND: ${template.vercelProjectName} in ${expectedAccount}`); return undefined; } throw error; }
  };
  let created = false;
  let original = await lookup();
  if (!original) {
    if (entry?.projectId) throw new SetupError("Previously saved project is missing; refusing to recreate it.");
    if (!options.execute) {
      log(`WOULD CREATE: ${template.vercelProjectName} in ${expectedAccount}, connect permanent Git source, set ${template.libraryDirectory}, deploy main, configure ${template.customDomain} and inspect only demo-${template.id} DNS.`);
      return "planned";
    }
    // An authenticated, scoped 404 is the only signal that permits creation.
    // Repeat the lookup to close the common stale-read race; never retry a POST.
    original = await lookup();
    if (!original) {
      if (entry) entry.projectRequestedAt = new Date().toISOString();
      checkpoint("pending");
      try {
        original = await operation("PROJECT_CREATE", () => api(scoped("/v11/projects"), "POST", {
          name: template.vercelProjectName, ...settings,
          gitRepository: { type: "github", repo: deploymentRepository },
        }));
        created = true;
      }
      catch (error) {
        // Creation may have succeeded despite a lost response, or another actor
        // may have created the same name. Recover only through an exact GET.
        try { original = await lookup(); } catch { throw error; }
        if (!original) throw error;
        created = true;
      }
    }
  }
  const verifyIdentity = () => {
    assertProject(original, template);
    if (original.accountId !== expectedAccount || (entry?.projectId && original.id !== entry.projectId)) throw new SetupError("Project/account differs from the protected anchors or saved identity.");
  };
  if (created) await operation("PROJECT_CONFIG", async () => verifyIdentity()); else verifyIdentity();
  if (entry) { entry.projectId = original.id; entry.accountId = original.accountId; }
  checkpoint("project-created", "Project"); progress("Project");
  const projectPath = scoped(`/v9/projects/${original.id}`);
  const readProject = async () => {
    const project = await api(projectPath); assertProject(project, template, original); return project;
  };
  let project = created ? await operation("PROJECT_CONFIG", readProject) : await readProject();
  if (created) {
    if (!correctLink(project.link, repo.id, deploymentRepository) || project.link.productionBranch !== "main") throw new VercelOperationError("GIT_CONNECT", "Created project readback did not verify the permanent Git repository and production branch main. Project retained; no deployment requested.");
    if (!Object.entries(settings).every(([key, value]) => value === null ? project[key] == null : project[key] === value)) throw new VercelOperationError("PROJECT_CONFIG", "Created project readback did not verify root/framework/build settings. Project retained; no deployment requested.");
    original.link = project.link; // Compare subsequent reads against the verified persisted link.
    log(`PROJECT_VERIFIED: ${project.name} / ${project.accountId} / ${deploymentRepository} / ${project.rootDirectory} / main`);
  }
  if (project.link && !correctLink(project.link, repo.id, deploymentRepository)) throw new SetupError("Project is connected to another repository. Refusing to disconnect or replace it.");
  if (project.link && project.link.productionBranch !== "main") throw new SetupError("Production branch must be main. Set it in Vercel Project Settings → Environments → Production, then retry; no undocumented branch API is used.");
  log(`Detected framework: ${framework}; build/install/output use Vercel detection. Ignored Build Step cleared for automatic builds.`);
  log(`PLAN: preserve project ${original.id} in account ${original.accountId}; PATCH only root/build settings; ${project.link ? "retain" : "connect"} permanent Git repository.`);
  // Validate DNS/domain conflicts and PAT access before changing project settings.
  const inspectedDomain = await deps.domain(template, original.id, original.accountId, true);
  const deploymentsPath = scoped(`/v6/deployments?projectId=${original.id}&target=production&limit=100`);
  const listing = await api(deploymentsPath);
  if (!Array.isArray(listing.deployments)) throw new SetupError("Invalid production deployment listing.");
  let matching = listing.deployments.find((d: Json) => (d.uid === project.targets?.production?.id || d.id === project.targets?.production?.id || ["BUILDING", "QUEUED", "INITIALIZING"].includes(d.readyState ?? d.state)) && d.target === "production" && d.meta?.githubCommitOrg === gitOwner &&
    d.meta?.githubCommitRepo === gitName && d.meta?.githubCommitRef === "main" &&
    ["READY", "BUILDING", "QUEUED", "INITIALIZING"].includes(d.readyState ?? d.state));
  const settingsMatch = Object.entries(settings).every(([key, value]) => value === null ? project[key] == null : project[key] === value);
  log(`Production from permanent Git source: ${matching ? (matching.readyState ?? matching.state) : "initial deployment required"}`);
  if (options.reconcileOnly) {
    // Read-only reconciliation ignores historical checkpoints and verifies the
    // current active production deployment, using the same setup inspection.
    if (settingsMatch && matching && (matching.readyState ?? matching.state) === "READY" && inspectedDomain === "SUCCESS" && httpsFirst) {
      const current = await api(scoped(`/v13/deployments/${matching.id ?? matching.uid}`));
      if (current.projectId !== original.id || current.target !== "production" || current.readyState !== "READY" ||
          current.gitSource?.type !== "github" || String(current.gitSource.repoId) !== String(repo.id) || current.gitSource.ref !== "main" ||
          project.targets?.production?.id !== (current.id ?? current.uid) ||
          typeof current.url !== "string" || !/^[a-zA-Z0-9.-]+\.vercel\.app$/.test(current.url)) {
        throw new SetupError("Reconciliation could not verify active Git-source production identity.");
      }
      if (entry) {
        entry.deploymentId = current.id ?? current.uid; entry.deploymentUrl = `https://${current.url}`;
        entry.deploymentSettings = JSON.stringify(settings); entry.needsDeployment = false;
        entry.status = "ready"; entry.lastSuccessfulStage = "HTTPS"; entry.lastError = null;
      }
      log(`RECONCILED READY: ${template.id}; preserve project, Git, deployment, domain and DNS.`);
      return "ready";
    }
    log(`RECONCILE: ${template.id} requires inspection/resume of missing stages; no writes performed.`);
    return "planned";
  }
  if (entry?.deploymentId) {
    const saved = await api(scoped(`/v13/deployments/${entry.deploymentId}`));
    if (saved.projectId !== original.id || saved.target !== "production" || saved.gitSource?.type !== "github" || String(saved.gitSource.repoId) !== String(repo.id) || saved.gitSource.ref !== "main") throw new SetupError("Saved deployment identity/source mismatch.");
    if (!["ERROR", "CANCELED"].includes(saved.readyState) && entry.deploymentSettings === JSON.stringify(settings)) {
      // A later Git push may have replaced the saved READY production deployment.
      // Prefer current production in that case; resume the saved ID while building.
      if (saved.readyState !== "READY" || project.targets?.production?.id === entry.deploymentId) matching = saved;
    } else if (["ERROR", "CANCELED"].includes(saved.readyState)) { matching = undefined; if (entry) { delete entry.deploymentRequestedAt; delete entry.deploymentId; entry.needsDeployment = true; } }
    else if (entry.needsDeployment) matching = undefined;
  } else if (entry?.deploymentRequestedAt) {
    matching = listing.deployments.find((d: Json) => d.target === "production" && d.meta?.githubCommitOrg === gitOwner && d.meta?.githubCommitRepo === gitName && d.meta?.githubCommitRef === "main" && Number(d.createdAt ?? d.created) >= Date.parse(entry.deploymentRequestedAt!) && ["READY", "BUILDING", "QUEUED", "INITIALIZING"].includes(d.readyState ?? d.state));
    if (!matching) throw new SetupError("An initial deployment request has an uncertain outcome. Inspect Vercel and reconcile the checkpoint before retrying; no duplicate deployment was requested.");
  } else if (entry?.needsDeployment) matching = undefined;
  const httpsBefore = await deps.https(template.customDomain);
  log(`Current HTTPS: ${httpsBefore ? "SUCCESS" : "PENDING/UNAVAILABLE"}`);
  if (!options.execute) {
    log("PLAN: verify Git link and production branch main after connection; create Git-source production deployment if needed; retain working domain/DNS; verify READY and HTTPS. No remote writes performed.");
    return "planned";
  }
  project = await readProject();
  if (JSON.stringify(project.link ?? null) !== JSON.stringify(original.link ?? null)) throw new SetupError("Git link changed during preflight; retry inspection.");
  if (!settingsMatch) {
    if (entry) entry.needsDeployment = true;
    checkpoint("project-created");
    await operation("PROJECT_CONFIG", () => api(projectPath, "PATCH", settings));
  }
  if (!project.link) await operation("GIT_CONNECT", async () => deps.connect(original.id, original.accountId, deploymentRepository));
  project = await readProject();
  if (!correctLink(project.link, repo.id, deploymentRepository) || project.link.productionBranch !== "main") throw new VercelOperationError("GIT_CONNECT", "Git/production-branch verification failed. No initial deployment requested; project retained.");
  if (!Object.entries(settings).every(([key, value]) => value === null ? project[key] == null : project[key] === value)) throw new VercelOperationError("PROJECT_CONFIG", "Root/framework/build verification failed. No initial deployment requested; project retained.");
  checkpoint("git-connected", "Git connection"); progress("Git connection");
  checkpoint("git-connected", "Root directory"); progress("Root directory");
  let deployment = settingsMatch && matching ? matching : undefined;
  if (!deployment) {
    if (entry) { entry.deploymentRequestedAt = new Date().toISOString(); entry.deploymentSettings = JSON.stringify(settings); delete entry.deploymentId; delete entry.deploymentUrl; }
    checkpoint("deploying");
    deployment = await operation("DEPLOYMENT", () => api(scoped("/v13/deployments"), "POST", {
      name: template.vercelProjectName, project: original.id, target: "production",
      gitSource: { type: "github", repoId: String(repo.id), ref: "main" },
    }));
  }
  if (!/^(dpl_|dep_)[a-zA-Z0-9_-]+$/.test(deployment.id ?? deployment.uid)) throw new SetupError("Invalid deployment identity; inspect project before retrying.");
  const deploymentId = deployment.id ?? deployment.uid;
  if (entry) { entry.deploymentId = deploymentId; entry.deploymentSettings = JSON.stringify(settings); }
  checkpoint("deploying");
  for (let attempt = 0; attempt < 60; attempt++) {
    deployment = await operation("DEPLOYMENT", () => api(scoped(`/v13/deployments/${deploymentId}`)));
    if (deployment.projectId !== original.id || deployment.target !== "production" || deployment.gitSource?.type !== "github" ||
        String(deployment.gitSource.repoId) !== String(repo.id) || deployment.gitSource.ref !== "main") throw new SetupError("Production deployment source/identity mismatch.");
    if (deployment.readyState === "READY") break;
    if (["ERROR", "CANCELED"].includes(deployment.readyState)) throw new VercelOperationError("DEPLOYMENT", "Production build failed; retained project/deployment. Inspect Vercel build logs.");
    if (attempt === 59) {
      if (entry) entry.lastError = "Production build remains pending after bounded polling; retained deployment will be inspected on resume.";
      checkpoint("deploying"); log("Production build remains pending; retained deployment will be inspected on resume."); return "deploying";
    }
    await deps.sleep(10_000);
  }
  if (typeof deployment.url !== "string" || !/^[a-zA-Z0-9.-]+\.vercel\.app$/.test(deployment.url)) throw new SetupError("Production deployment returned no valid URL.");
  if (entry) { entry.deploymentUrl = `https://${deployment.url}`; entry.needsDeployment = false; }
  checkpoint("deployed", "Production deploy"); progress("Production deploy");
  const domainResult = await deps.domain(template, original.id, original.accountId, false);
  checkpoint("domain-configured", "DNS"); progress("Domain"); progress("DNS");
  if (domainResult !== "SUCCESS") { if (entry) entry.lastError = "Domain verification pending; configuration retained."; checkpoint("domain-configured"); log("Domain verification PENDING; retained configuration will be checked on resume."); return "domain-configured"; }
  project = await readProject();
  if (!correctLink(project.link, repo.id, deploymentRepository) || project.rootDirectory !== template.libraryDirectory || project.link.productionBranch !== "main") throw new SetupError("Final project verification failed.");
  if (project.targets?.production?.id !== deploymentId) throw new SetupError("READY deployment is not the active production target; inspect Vercel promotion settings.");
  for (let attempt = 0; attempt < 6; attempt++) {
    if (await deps.https(template.customDomain)) { checkpoint("ready", "HTTPS"); progress("HTTPS"); log(`READY: https://${template.customDomain}`); log(`SUCCESS: permanent Git integration, root, production deployment, domain, DNS and HTTPS verified: https://${template.customDomain}`); return "ready"; }
    if (attempt < 5) await deps.sleep(10_000);
  }
  if (entry) entry.lastError = "HTTPS still provisioning after bounded polling; deployment/domain/DNS retained.";
  checkpoint("domain-configured"); log("HTTPS PENDING; configuration retained for a future check.");
  return "domain-configured";
}
export function mainDependencies(options: Pick<SetupOptions, "execute" | "scope">): Dependencies {
  const root = resolve(__dirname, "../../..");
  if (options.execute) { try { loadToken(join(root, ".env.local")); } catch { throw new SetupError("GoDaddy PAT preflight failed. Check .env.local GODADDY_PAT before any setup writes."); } }
  const directory = mkdtempSync(join(tmpdir(), "grids-git-setup-"));
  process.once("exit", () => rmSync(directory, { recursive: true, force: true }));
  const env: NodeJS.ProcessEnv = { CI: "1", NO_COLOR: "1", VERCEL_TELEMETRY_DISABLED: "1" };
  for (const key of ["PATH", "HOME", "USER", "LOGNAME", "TMPDIR", "LANG"]) if (process.env[key]) env[key] = process.env[key];
  const config = join(directory, "vercel.json"); writeFileSync(config, "{}");
  const run = (args: string[], input?: string) => {
    const method = args.includes("-X") ? args[args.indexOf("-X") + 1] : "GET";
    const operation = args[0] === "git" ? "GIT_CONNECT" : operationForRequest(args[1], method);
    const result = spawnSync("vercel", [...args, "--local-config", config, ...(options.scope ? ["--scope", options.scope] : [])], {
      cwd: directory, env, encoding: "utf8", input, timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
    });
    if (result.error || result.status !== 0) {
      throw new VercelOperationError(operation, `${cliErrorDescription(result.stdout ?? "", result.stderr ?? "")}; no automatic write retry.`, undefined, result.status);
    }
    return result.stdout;
  };
  const rest = authenticatedRest(options.scope);
  const api: Dependencies["api"] = async (path, method = "GET", body) => {
    if (!options.execute && method !== "GET") throw new SetupError("Dry run refused a remote write.");
    return rest(path, method, body);
  };
  return {
    api, github: path => { try { return JSON.parse(gh(["api", "--hostname", "github.com", "--method", "GET", path])); } catch { throw new SetupError("GitHub read failed. Check gh login and access to the permanent private repository."); } },
    connect: (projectId, accountId, deploymentRepository) => {
      if (!options.execute) throw new SetupError("Dry run refused Git connect.");
      mkdirSync(join(directory, ".vercel"), { recursive: true });
      writeFileSync(join(directory, ".vercel/project.json"), JSON.stringify({ projectId, orgId: accountId }));
      run(["git", "connect", `https://github.com/${deploymentRepository}.git`, "--yes"]);
    },
    domain: (template, projectId, accountId, dryRun) => configureDomain({
      template, projectId, accountId, envFile: join(root, ".env.local"), preserveExisting: true, librarySetup: true, dryRun,
      api: (path, method, body) => api(path, method, body), status: (stage, value) => console.log(`${stage}: ${value}`),
    }),
    https: async domain => {
      try { const response = await fetch(`https://${domain}`, { redirect: "manual", signal: AbortSignal.timeout(15_000) }); await response.body?.cancel(); return response.status >= 200 && response.status < 400; }
      catch { return false; }
    },
    sleep: ms => new Promise(done => setTimeout(done, ms)), log: console.log,
  };
}
export async function resolveSetupAccount(deps: Dependencies): Promise<string> {
  let accountId: string | undefined;
  for (const id of ["001", "002"]) {
    const template = resolveTemplate(id);
    const anchor = await retryRead(() => deps.api(scopePath(`/v9/projects/${template.vercelProjectName}`, accountId)), deps.sleep);
    assertProject(anchor, template);
    if (anchor.link?.type !== "github" || anchor.link.org !== template.deploymentRepository.split("/")[0] || anchor.link.repo !== template.deploymentRepository.split("/")[1] || anchor.rootDirectory !== template.libraryDirectory || anchor.link.productionBranch !== "main") throw new SetupError(`Protected anchor ${id} is not configured as expected; no changes attempted.`);
    if (accountId && accountId !== anchor.accountId) throw new SetupError("001 and 002 are in different Vercel accounts; no changes attempted.");
    accountId = anchor.accountId;
  }
  return accountId!;
}
export async function runSingle(options: SetupOptions, deps: Dependencies, statePath: string): Promise<void> {
  if (protectedId(options.id)) { deps.log(`${options.id} SKIP — already configured`); return; }
  if (options.execute) mkdirSync(resolve(statePath, ".."), { recursive: true });
  const release = options.execute ? acquireLock(`${statePath}.lock`) : () => {};
  try {
    const state = loadSetupState(statePath);
    const entry = state.templates.find(t => t.id === options.id)!;
    if (entry.status === "ready") { deps.log(`${entry.id} SKIP — ready`); return; }
    const accountId = await resolveSetupAccount(deps);
    if (state.accountId && state.accountId !== accountId) throw new SetupError("Saved setup account differs from verified anchors.");
    state.accountId = accountId;
    const persist = () => { if (options.execute) saveSetupState(statePath, state); };
    persist();
    try { await setup({ ...options, accountId, entry, checkpoint: (status, stage) => {
      entry.status = status; if (stage) { entry.lastSuccessfulStage = stage; entry.lastError = null; } entry.updatedAt = new Date().toISOString(); persist();
    } }, deps); }
    catch (error) { if (options.execute) { entry.status = "failed"; entry.lastError = setupErrorMessage(error); entry.updatedAt = new Date().toISOString(); persist(); } throw error; }
  } finally { release(); }
}
if (require.main === module) {
  (async () => {
    const options = parseArgs(process.argv.slice(2));
    if (options.diagnose) {
      const report = await diagnoseTemplate(options, mainDependencies({ ...options, execute: false }), resolve(__dirname, "../../.."));
      if (report.failures) process.exitCode = 1;
      return;
    }
    if (protectedId(options.id)) { console.log(`${options.id} SKIP — already configured`); return; }
    verifyGitHubCli();
    await runSingle(options, mainDependencies(options), resolve(__dirname, "../../../.tmp/templates-setup-state.json"));
  })().catch((error: unknown) => { console.error(setupErrorMessage(error)); process.exitCode = 1; });
}
