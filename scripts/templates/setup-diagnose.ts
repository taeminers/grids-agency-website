// Diagnostic inspection is deliberately independent of setup/resume mutations.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import type { Dependencies, SetupOptions } from "./setup-vercel";
import { resolveTemplate } from "./manifest";
import { SetupError } from "./setup-state";
import { sanitizeDiagnostic, VercelApiError, VercelOperationError } from "./vercel-errors";

type Data = Record<string, unknown>;
const object = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
function safeFields(value: unknown, keys: string[]): Data {
  const source = object(value), selected: Data = {};
  for (const key of keys) {
    const field = source[key];
    if (typeof field === "string") selected[key] = sanitizeDiagnostic(field);
    else if (typeof field === "boolean" || typeof field === "number" || field === null) selected[key] = field;
  }
  return selected;
}
export interface DiagnosticLocal {
  libraryRoot?: string;
  cliConfigFiles?: string[];
}
function configCandidates(): string[] {
  const home = homedir();
  return [
    join(home, "Library/Application Support/com.vercel.cli/config.json"),
    join(process.env.XDG_DATA_HOME || join(home, ".local/share"), "com.vercel.cli/config.json"),
    join(home, ".config/vercel/config.json"), join(home, ".vercel/config.json"),
  ];
}
export async function diagnoseTemplate(options: SetupOptions, deps: Dependencies, root: string, local: DiagnosticLocal = {}): Promise<{ failures: number }> {
  if (options.id !== "003" || options.execute || !options.diagnose) throw new SetupError("Diagnostic mode is read-only and enabled ONLY for --id=003 --diagnose.");
  const template = resolveTemplate("003"), log = deps.log;
  let failures = 0;
  log(`GRIDS TEMPLATE 003 READ-ONLY DIAGNOSTIC\nExpected project: ${template.vercelProjectName}\nDeployment Git Repository: ${template.deploymentRepository}\nExpected root directory: ${template.libraryDirectory}\nExpected domain: ${template.customDomain}\nNo setup, deployment, DNS, Git connection or state writes will run.`);
  const print = (label: string, value: unknown) => log(`${label}: ${JSON.stringify(value)}`);
  const attempt = async <T>(label: string, task: () => Promise<T>): Promise<T | undefined> => {
    try { return await task(); }
    catch (error) {
      failures++;
      log(`${label}: ${error instanceof VercelOperationError ? error.message : "READ_FAILED | " + (error instanceof SetupError ? sanitizeDiagnostic(error.message) : "Private error suppressed; read did not complete.")}`);
      return undefined;
    }
  };
  // Only the following GET endpoints may be reached from diagnostic code. The
  // production adapter independently refuses every write with execute=false.
  const get = async (path: string) => {
    const route = path.split("?")[0];
    if (!(route === "/v2/user" || /^\/v2\/teams\/[a-zA-Z0-9_-]+$/.test(route) ||
      /^\/v9\/projects\/(?:grids-demo-00[123]|prj_[a-zA-Z0-9_-]+)$/.test(route) ||
      route === "/v1/integrations/search-repo" || route === "/v1/integrations/git-namespaces")) throw new SetupError("Diagnostic refused an endpoint outside its read-only allowlist.");
    return deps.api(path, "GET");
  };
  const libraryRoots = local.libraryRoot || process.env.GRIDS_TEMPLATE_LIBRARY_PATH
    ? [resolve(local.libraryRoot || process.env.GRIDS_TEMPLATE_LIBRARY_PATH!)]
    : [resolve(dirname(root), "grids-template-library"), resolve(root, "../../grids-template-library"), resolve(root, "grids-template-library")];
  const directories = libraryRoots.map(libraryRoot => {
    const directory = join(libraryRoot, template.libraryDirectory);
    let exists = false;
    try { exists = statSync(directory).isDirectory(); } catch { /* absence/permission is reported */ }
    return { directory, exists };
  });
  print("Local library directory exists", directories.some(d => d.exists));
  print("Local library paths checked", directories.map(d => ({ ...d, directory: sanitizeDiagnostic(d.directory) })));
  log("Local directory checks only test the permanent-library candidates; temporary upstream clones are not accepted. Set GRIDS_TEMPLATE_LIBRARY_PATH if your library checkout is elsewhere.");

  let configuredTeam: string | undefined;
  for (const file of local.cliConfigFiles ?? configCandidates()) {
    if (!existsSync(file)) continue;
    try {
      // config.json only. Never open auth.json or any credential store.
      const config = object(JSON.parse(readFileSync(file, "utf8")));
      if (typeof config.currentTeam === "string" && /^team_[a-zA-Z0-9_-]+$/.test(config.currentTeam)) configuredTeam = config.currentTeam;
      print("CLI config scope metadata", { file: sanitizeDiagnostic(file), currentTeam: configuredTeam ?? null });
    } catch { failures++; log("CLI config scope metadata: unreadable/invalid config.json; credentials were not inspected."); }
    break;
  }
  print("Explicit Vercel scope", options.scope ?? null);
  print("Configured CLI team", configuredTeam ?? "not found/set; API visibility will determine available scope evidence");
  log("Vercel reads use the same isolated CLI context as setup, so the agency checkout's local .vercel link cannot change scope.");
  const userResponse = await attempt("Authenticated Vercel user", () => get("/v2/user"));
  const user = object(userResponse?.user ?? userResponse);
  print("Authenticated Vercel user", safeFields(user, ["id", "uid", "username", "name", "version", "defaultTeamId"]));

  const projects = new Map<string, Data>();
  for (const id of ["001", "002", "003"]) {
    let notVisible = false;
    const project = await attempt(`PROJECT_INSPECT ${id}`, async () => {
      try { return await get(`/v9/projects/grids-demo-${id}`); }
      catch (error) {
        if (error instanceof VercelApiError && error.status === 404) { notVisible = true; log(`grids-demo-${id}: NOT VISIBLE in current scope (HTTP 404). Existence in another scope or without permissions cannot be excluded. ${error.message}`); return undefined; }
        throw error;
      }
    });
    if (project) {
      if (project.name !== `grids-demo-${id}` || typeof project.accountId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(project.accountId) || typeof project.id !== "string" || !/^prj_[a-zA-Z0-9_-]+$/.test(project.id)) {
        failures++; log(`grids-demo-${id}: unexpected identity; private response suppressed.`); continue;
      }
      projects.set(id, project);
      print(`grids-demo-${id} visible`, safeFields(project, ["id", "name", "accountId"]));
    } else if (!notVisible) log(`grids-demo-${id}: visibility UNKNOWN because inspection failed.`);
  }
  print("Expected project currently exists", projects.has("003") ? "YES, visible in current scope" : "UNKNOWN/NOT VISIBLE; see PROJECT_INSPECT 003 result");
  const accounts = new Set([...projects.values()].map(p => String(p.accountId)));
  const evidenceAccount = accounts.size === 1 ? [...accounts][0] : undefined;
  const defaultTeam = typeof user.defaultTeamId === "string" && /^team_[a-zA-Z0-9_-]+$/.test(user.defaultTeamId) ? user.defaultTeamId : undefined;
  const personalAccount = user.version !== "northstar" && typeof (user.id ?? user.uid) === "string" && /^[a-zA-Z0-9_-]+$/.test(String(user.id ?? user.uid)) ? String(user.id ?? user.uid) : undefined;
  const currentAccount = evidenceAccount ?? (!options.scope ? configuredTeam ?? defaultTeam ?? personalAccount : options.scope === user.username ? personalAccount : undefined);
  print("Current Vercel account/team scope", { requested: options.scope ?? null, configuredTeam: configuredTeam ?? null, accountId: currentAccount ?? "UNKNOWN", evidence: evidenceAccount ? "project visibility responses" : "local CLI configuration/user default; not confirmed by project visibility" });
  print("001 and 002 visible in same scope", projects.has("001") && projects.has("002") ? projects.get("001")!.accountId === projects.get("002")!.accountId : "UNKNOWN/NO; see visibility results");
  if (accounts.size > 1) { failures++; log("SCOPE_MISMATCH: visible projects report different account IDs. No account switch or repair was attempted."); }
  if (currentAccount?.startsWith("team_")) {
    const team = await attempt("SCOPE_INSPECT", () => get(`/v2/teams/${currentAccount}`));
    if (team) print("Current Vercel team", safeFields(team.team ?? team, ["id", "slug", "name"]));
  }
  const project = projects.get("003");
  if (project) {
    print("003 current project configuration", safeFields(project, ["id", "name", "accountId", "rootDirectory", "framework", "buildCommand", "installCommand", "outputDirectory", "commandForIgnoringBuildStep", "nodeVersion", "autoAssignCustomDomains", "updatedAt"]));
    print("003 existing Git configuration", project.link ? safeFields(project.link, ["type", "org", "repo", "repoId", "productionBranch", "sourceless"]) : "No persistent Git link");
    const production = object(object(project.targets).production);
    print("003 production target", safeFields(production, ["id", "url", "readyState", "target", "createdAt"]));
    print("003 root directory matches", project.rootDirectory === template.libraryDirectory);
  }

  const statePath = join(root, ".tmp/templates-setup-state.json");
  if (existsSync(statePath)) {
    await attempt("003 local setup state", async () => {
      const state = object(JSON.parse(readFileSync(statePath, "utf8")));
      const entry = Array.isArray(state.templates) ? state.templates.find(value => object(value).id === "003") : undefined;
      print("Saved setup account", safeFields(state, ["accountId"]));
      print("003 local setup state", safeFields(entry, ["id", "theme", "status", "projectId", "accountId", "deploymentId", "deploymentUrl", "lastSuccessfulStage", "lastError", "updatedAt", "projectRequestedAt", "deploymentRequestedAt", "needsDeployment"]));
      return true;
    });
  } else log("003 local setup state: no checkpoint file exists; nothing was initialized.");

  const repo = await attempt("GitHub CLI repository read", async () => deps.github(`/repos/${template.deploymentRepository}`));
  if (repo) print("GitHub CLI can read library", repo.full_name === template.deploymentRepository);
  const directory = await attempt("GitHub permanent directory read", async () => deps.github(`/repos/${template.deploymentRepository}/contents/${template.libraryDirectory}?ref=main`));
  if (directory) print("Expected directory exists on GitHub main", Array.isArray(directory));
  // This is Vercel's supported repository search, not a connect/import request.
  // Do not claim GH CLI access proves Vercel GitHub App access.
  const namespaceResponse = await attempt("GIT_NAMESPACE_INSPECT", () => get("/v1/integrations/git-namespaces?provider=github"));
  const namespaces = Array.isArray(namespaceResponse) ? namespaceResponse : Array.isArray(namespaceResponse?.namespaces) ? namespaceResponse.namespaces : namespaceResponse?.slug ? [namespaceResponse] : [];
  const namespace = object(namespaces.find((value: unknown) => object(value).slug === "taeminers" && object(value).provider === "github"));
  print("Vercel taeminers GitHub namespace", Object.keys(namespace).length ? safeFields(namespace, ["slug", "provider", "isAccessRestricted", "requireReauth"]) : "NOT CONFIRMED — no matching namespace was returned");
  const namespaceId = (typeof namespace.id === "string" || typeof namespace.id === "number") && /^[a-zA-Z0-9_-]+$/.test(String(namespace.id)) ? `&namespaceId=${encodeURIComponent(String(namespace.id))}` : "";
  const searchPath = "/v1/integrations/search-repo?provider=github&query=" + encodeURIComponent(template.deploymentRepository.split("/")[1]) + namespaceId + (currentAccount?.startsWith("team_") ? `&teamId=${encodeURIComponent(currentAccount)}` : "");
  const repositories = await attempt("GIT_INTEGRATION_INSPECT", () => get(searchPath));
  if (repositories) {
    const candidates = Array.isArray(repositories) ? repositories : Array.isArray(repositories.repos) ? repositories.repos : undefined;
    if (!candidates) { failures++; log("Vercel repository/integration access: UNKNOWN — unexpected repository search response; private response suppressed."); }
    else {
      const exact = candidates.find((entry: unknown) => {
        const r = object(entry), namespace = object(r.namespace), owner = object(r.owner);
        return (r.slug === template.deploymentRepository.split("/")[1] || r.name === template.deploymentRepository.split("/")[1]) &&
          [typeof r.namespace === "string" ? r.namespace : namespace.slug, namespace.name, typeof r.owner === "string" ? r.owner : owner.login, owner.name].includes("taeminers");
      });
      const accessConfirmed = exact && namespace.isAccessRestricted !== true && namespace.requireReauth !== true;
      print("Vercel can access permanent GitHub repository/integration", accessConfirmed ? "YES — exact repository returned by Vercel repository search" : "NOT CONFIRMED — repository not returned; GitHub App access or namespace selection may need inspection");
      if (!accessConfirmed) failures++;
    }
  } else log("Vercel repository/integration access: UNKNOWN — repository search failed. Existing 001/002 links alone do not prove current import permission.");
  log(`DIAGNOSTIC COMPLETE: ${failures} failed/unconfirmed checks. No writes or retries were performed. Historical generic errors cannot identify the exact prior failed request; these checks and new operation labels provide evidence for the next diagnosis.`);
  return { failures };
}
