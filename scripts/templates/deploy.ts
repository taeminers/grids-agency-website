// Manual, single-template deployment using permanent IDs. Never import into the Next.js app.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { ghEnvironment, verifyGitHubCli } from "./shared";
import { resolveTemplate, Template } from "./manifest";
import { printPlan } from "./plan";
import { createWorkspace, Workspace } from "./workspace";
import { configureDomain, domainHostname, DomainStatus } from "./domain";

type Stage = "Clone" | "Install" | "Build" | "Deploy";
const stages: Record<Stage, string> = { Clone: "NOT RUN", Install: "NOT RUN", Build: "NOT RUN", Deploy: "NOT RUN" };
const root = resolve(__dirname, "../../..");
let theme: Template | undefined;
let workspace: Workspace | undefined;
let liveRequested = false;
let projectName = "";
let liveUrl = "";
let activeStage: Stage | undefined;
let domainRequested = false;
const domainStatus: DomainStatus = { assignment: "NOT REQUESTED", dns: "NOT REQUESTED", verification: "NOT REQUESTED" };

// CLI credentials remain available through local login files, not environment tokens.
// Application/public env variables, npm-injected project settings, and Vercel target
// overrides are deliberately absent from every install/build/deploy environment.
function cleanEnvironment(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { CI: "1", NO_COLOR: "1", VERCEL_TELEMETRY_DISABLED: "1" };
  for (const key of ["PATH", "HOME", "USER", "LOGNAME", "TMPDIR", "TEMP", "TMP", "LANG", "LC_ALL", "SYSTEMROOT"]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}

function redact(text: string): string {
  let result = text;
  for (const [key, value] of Object.entries(process.env)) {
    if (value && /token|secret|password|credential|api_?key|private_?key/i.test(key)) {
      result = result.split(value).join("[REDACTED]");
    }
  }
  return result
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)\b/g, "[REDACTED]")
    .replace(/(Bearer\s+)\S+/gi, "$1[REDACTED]")
    .replace(/((?:token|secret|password|api[_-]?key|authorization)["']?\s*[:=]\s*)[^\s,]+/gi, "$1[REDACTED]")
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, "$1[REDACTED]@");
}

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv, showOutput = false): string {
  const result = spawnSync(command, args, {
    cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 128 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (showOutput || result.status !== 0) {
    const safeOutput = redact(output).trim();
    if (safeOutput) console.log(safeOutput.slice(-16_000));
  }
  if (result.error || result.status !== 0) {
    const reason = result.error && "code" in result.error && result.error.code === "ENOENT"
      ? " is not installed or available on PATH"
      : ` failed (${result.signal ?? result.status ?? "could not start"})`;
    throw new Error(`${command}${reason}.`);
  }
  return result.stdout.trim();
}

function summary(): void {
  console.log("\nGRIDS TEMPLATE DEPLOYMENT\n");
  if (theme) {
    console.log(`ID:                  ${theme.id}\nTheme:               ${theme.theme}\nRepository:          ${theme.repository}\n`);
  }
  for (const stage of Object.keys(stages) as Stage[]) console.log(`${(domainRequested && stage === "Deploy" ? "Vercel deployment" : stage) + ":"}`.padEnd(22) + stages[stage]);
  if (domainRequested) {
    console.log("Domain assignment:".padEnd(22) + domainStatus.assignment);
    console.log("GoDaddy DNS:".padEnd(22) + domainStatus.dns);
    console.log("Domain verification:".padEnd(22) + domainStatus.verification);
  }
  if (projectName) console.log(`\nVercel project:\n${projectName}`);
  if (liveUrl) console.log(`\n${domainRequested ? "Production URL" : "Live URL"}:\n${domainRequested && domainStatus.assignment === "SUCCESS" ? `https://${theme!.customDomain}` : liveUrl}`);
}

function parseOptions(): { id: string; dryRun: boolean; configure: boolean } {
  const args = process.argv.slice(2);
  const ids = args.filter((arg) => /^--id=\d{3}$/.test(arg));
  if (ids.length !== 1 || ids[0] === "--id=000" || new Set(args).size !== args.length ||
      args.some((arg) => arg !== ids[0] && arg !== "--dry-run" && arg !== "--configure-domain")) {
    throw new Error("Require exactly one explicit ID, optional --configure-domain and --dry-run.");
  }
  return { id: ids[0].slice(5), dryRun: args.includes("--dry-run"), configure: args.includes("--configure-domain") };
}

function inspectProject(directory: string) {
  const pkg = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  const lockfiles = ["package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"]
    .filter((file) => existsSync(join(directory, file)));
  const indicators = [".npmrc", ".yarnrc", ".yarnrc.yml", ".pnp.cjs"].filter((file) => existsSync(join(directory, file)));
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  const frameworks = Object.fromEntries(Object.entries(dependencies).filter(([name]) =>
    /^(astro|next|react|react-dom|vue|nuxt|svelte|vite|gatsby|@astrojs\/|@sveltejs\/|@remix-run\/|@vitejs\/|@nuxt\/)/.test(name),
  ));
  console.log("\nCloned project package.json inspection:");
  console.log(redact(JSON.stringify({
    packageManager: pkg.packageManager ?? "not specified",
    lockfiles, packageManagerConfig: indicators, scripts: pkg.scripts ?? {},
    frameworkDependencies: frameworks, nodeEngine: pkg.engines?.node ?? "not specified",
  }, null, 2)));
  if (!pkg.scripts?.build || typeof pkg.scripts.build !== "string") throw new Error("The cloned project has no build script. Deployment stopped.");
  if (lockfiles.length !== 1) throw new Error("Require exactly one supported lockfile; missing or ambiguous package manager. Deployment stopped.");
  const manager = lockfiles[0].startsWith("pnpm") ? "pnpm"
    : lockfiles[0] === "yarn.lock" ? "yarn"
    : lockfiles[0].startsWith("bun.") ? "bun" : "npm";
  if (pkg.packageManager && (typeof pkg.packageManager !== "string" || !pkg.packageManager.startsWith(`${manager}@`))) {
    throw new Error("packageManager conflicts with the lockfile. Deployment stopped.");
  }
  const framework = dependencies.astro ? "astro" : dependencies.next ? "nextjs"
    : dependencies["@sveltejs/kit"] ? "sveltekit" : dependencies.nuxt ? "nuxtjs"
    : dependencies.gatsby ? "gatsby" : dependencies.vite ? "vite" : undefined;
  return { manager, packageManager: pkg.packageManager as string | undefined, framework };
}

function checkCloneSafety(directory: string): void {
  // Never use credentials/env files or an existing Vercel link from the theme.
  function visit(current: string): void {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if ([".git", "node_modules", ".grids-tooling"].includes(entry.name)) continue;
      if (entry.isSymbolicLink()) throw new Error("Symlinks in the cloned project require manual review. Deployment stopped.");
      if (entry.name === ".vercel") throw new Error("The clone already contains a Vercel link. Deployment stopped.");
      if (/^\.env(?:\.|$)/.test(entry.name) && !/\.(example|sample|template)$/.test(entry.name)) {
        throw new Error("The clone contains an environment file. Remove it from the temporary copy and review before deploying; values were not printed.");
      }
      if (/\.(pem|key)$/.test(entry.name)) throw new Error("The clone contains a key file. Deployment stopped for manual review.");
      if (entry.isDirectory()) visit(join(current, entry.name));
      else if ([".npmrc", ".yarnrc", ".yarnrc.yml"].includes(entry.name) && /_auth|authToken|password|npmAuth|token\s*[:=]/i.test(readFileSync(join(current, entry.name), "utf8"))) {
        throw new Error("Package manager config contains authentication settings. Deployment stopped; values were not printed.");
      }
    }
  }
  visit(directory);
  const configPath = join(directory, "vercel.json");
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    for (const key of ["env", "alias", "name", "projectId", "orgId", "scope", "domains"]) {
      if (key in config) throw new Error(`vercel.json contains ${key}; deployment stopped for manual review.`);
    }
    if (config.build?.env) throw new Error("vercel.json contains build environment values. Deployment stopped for manual review.");
  }
}

async function deploy(): Promise<void> {
  const { id, dryRun, configure } = parseOptions();
  theme = resolveTemplate(id);
  projectName = theme.vercelProjectName;
  domainRequested = configure;
  if (configure) domainHostname(theme);
  if (dryRun) {
    console.log("GRIDS TEMPLATE DRY RUN\nNo cloning, installation, builds, Vercel changes, or DNS changes.");
    printPlan(theme, configure);
    return;
  }
  liveRequested = true;
  if (theme.existingDeployment) {
    console.log(`Template ${theme.id} is already live at https://${theme.customDomain}. Existing project is protected; no actions were taken.`);
    for (const stage of Object.keys(stages) as Stage[]) stages[stage] = "SKIPPED (already deployed)";
    liveUrl = `https://${theme.customDomain}`;
    return;
  }
  console.log(`Selected manifest template ${theme.id}: ${theme.repository}\nTarget Vercel project: ${projectName}\nCustom domain: ${theme.customDomain}${configure ? " (configuration requested)" : " (metadata only)"}`);
  verifyGitHubCli();
  workspace = createWorkspace(root, id);
  const directory = workspace.directory;
  const cliEnv = cleanEnvironment();

  activeStage = "Clone";
  console.log("\nCloning requested repository only...");
  // gh supplies its local credentials to git; no token is passed in arguments.
  run("gh", ["repo", "clone", theme.repository, directory], root, ghEnvironment);
  stages.Clone = "SUCCESS";

  activeStage = "Install";
  const { manager, packageManager, framework } = inspectProject(directory);
  checkCloneSafety(directory);
  const home = join(directory, ".grids-tooling/home");
  mkdirSync(home, { recursive: true });
  const buildEnv = { ...cliEnv, HOME: home, XDG_CONFIG_HOME: home, XDG_CACHE_HOME: join(home, "cache") };
  const version = run(manager, ["--version"], directory, buildEnv);
  if (packageManager && version !== packageManager.slice(manager.length + 1).split("+")[0]) {
    throw new Error(`Installed ${manager} version does not match packageManager. Activate ${packageManager} before retrying.`);
  }
  const installArgs = manager === "npm" ? ["ci"]
    : manager === "yarn" && Number(version.split(".")[0]) >= 2 ? ["install", "--immutable"]
    : ["install", "--frozen-lockfile"];
  console.log(`\nInstalling dependencies: ${manager} ${installArgs.join(" ")}`);
  run(manager, installArgs, directory, buildEnv, true);
  stages.Install = "SUCCESS";

  activeStage = "Build";
  console.log(`\nBuilding locally: ${manager} run build`);
  run(manager, ["run", "build"], directory, buildEnv, true);
  stages.Build = "SUCCESS";
  checkCloneSafety(directory);

  activeStage = "Deploy";
  // No Vercel command is reached until the local build has succeeded.
  try {
    run("vercel", ["--version"], directory, cliEnv);
    run("vercel", ["whoami"], directory, cliEnv);
  } catch {
    throw new Error("Vercel CLI must be installed and authenticated. Run npm install -g vercel, then vercel login. No deployment was attempted.");
  }
  const configPath = join(directory, "vercel.json");
  if (!existsSync(configPath)) writeFileSync(configPath, "{}\n", { flag: "wx" });
  // Append exclusions after any theme rules so credentials cannot be re-included.
  const ignorePath = join(directory, ".vercelignore");
  const ignore = existsSync(ignorePath) ? readFileSync(ignorePath, "utf8") : "";
  writeFileSync(ignorePath, `${ignore}\n# GRIDS proof-of-concept exclusions\n.git\n**/.git/**\n.vercel\n.env*\n**/.env*\n.npmrc\n**/.npmrc\n**/*.pem\n**/*.key\n.grids-tooling\nnode_modules\n`);
  const configArgs = ["--local-config", configPath];
  console.log(`\nCreating a fresh Vercel project: ${projectName}`);
  // Use the CLI's authenticated API request: `project add` treats an existing
  // name as success. POST instead must create a NEW project or stop on conflict.
  // Never reuse a project with unknown domains/secrets or delete any project.
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const requestPath = join(directory, ".grids-tooling/create-project.json");
  writeFileSync(requestPath, JSON.stringify({
    name: projectName, framework: config.framework ?? framework ?? null,
    installCommand: `${manager} ${installArgs.join(" ")}`, buildCommand: `${manager} run build`,
  }));
  const created = JSON.parse(run("vercel", ["api", "/v10/projects", "-X", "POST", "--input", requestPath, ...configArgs], directory, cliEnv));
  if (created.error || created.name !== projectName || typeof created.id !== "string" || typeof created.accountId !== "string") {
    throw new Error("Vercel did not confirm creation of a fresh demo project. Deployment stopped.");
  }
  run("vercel", ["link", "--yes", "--project", projectName, ...configArgs], directory, cliEnv, true);
  const link = JSON.parse(readFileSync(join(directory, ".vercel/project.json"), "utf8"));
  if (link.projectId !== created.id || link.orgId !== created.accountId || (link.projectName && link.projectName !== projectName)) {
    throw new Error("Vercel link does not match the newly created demo project. Deployment stopped.");
  }
  const deployEnv = { ...cliEnv, VERCEL_PROJECT_ID: link.projectId, VERCEL_ORG_ID: link.orgId };
  console.log(`\nDeploying production to ${projectName}...`);
  const output = run("vercel", ["deploy", "--prod", "--yes", ...configArgs], directory, deployEnv, true);
  // Vercel documents stdout as the resulting deployment URL.
  const urls = output.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app\b/g);
  if (!urls?.length) throw new Error("Vercel completed but returned no vercel.app URL. Inspect the new demo project manually; no retry was attempted.");
  liveUrl = urls[urls.length - 1];
  stages.Deploy = "SUCCESS";
  activeStage = undefined;
  if (configure) {
    await configureDomain(theme, {
      projectId: created.id, accountId: created.accountId,
      envFile: join(root, ".env.local"), status: domainStatus,
      api: (path, method = "GET", body) => {
        const args = ["api", path, "-X", method];
        if (body) {
          const input = join(directory, ".grids-tooling/domain-request.json");
          writeFileSync(input, JSON.stringify(body));
          args.push("--input", input);
        }
        // Suppress all CLI stderr on domain requests, including failure responses.
        const result = spawnSync("vercel", [...args, ...configArgs], {
          cwd: directory, env: cliEnv, encoding: "utf8", timeout: 15_000,
          stdio: ["ignore", "pipe", "pipe"], maxBuffer: 4 * 1024 * 1024,
        });
        if (result.error || result.status !== 0) throw new Error("Vercel domain API request failed; credentials and server output were suppressed.");
        try {
          const data = JSON.parse(result.stdout);
          if (!data || typeof data !== "object" || data.error) throw new Error();
          return data;
        } catch { throw new Error("Vercel domain API returned an invalid response."); }
      },
    });
  }
}

async function main(): Promise<void> {
try {
  await deploy();
} catch (error: unknown) {
  if (activeStage) stages[activeStage] = "FAILED";
  console.error(`\nTemplate deployment failed: ${redact(error instanceof Error ? error.message : "Unexpected failure.")}`);
  process.exitCode = 1;
} finally {
  if (workspace) {
    try {
      workspace.cleanup();
      console.log("\nTemporary deployment workspace: CLEANED UP");
    } catch {
      console.error("Temporary workspace cleanup failed or was refused because its path changed. No other directories were deleted.");
      process.exitCode = 1;
    }
  }
  if (liveRequested) summary();
}

}
void main();
