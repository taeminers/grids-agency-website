// Non-secret checkpoints, atomically replaced after every meaningful stage.
import { closeSync, existsSync, fsyncSync, lstatSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { loadManifest, Template } from "./manifest";
export const statuses = ["pending", "deploying", "deployed", "domain-configured", "ready", "failed"] as const;
export const stageNames = ["Clone", "Install", "Build", "Project", "Deploy", "Domain assignment", "GoDaddy DNS", "Domain verification", "HTTPS"] as const;
export interface Entry {
  id: string; theme: string; status: typeof statuses[number]; lastSuccessfulStage: string | null;
  vercelProjectName: string; vercelDeploymentUrl: string | null; customDomain: string;
  lastError: string | null; updatedAt: string;
  projectId?: string; accountId?: string; deploymentStartedAt?: string; projectCreationStartedAt?: string;
}
export interface State { version: 1; templates: Entry[] }
export function initialState(): State {
  return { version: 1, templates: loadManifest().map(t => ({ id: t.id, theme: t.theme,
    status: t.existingDeployment ? "ready" : "pending", lastSuccessfulStage: t.existingDeployment ? "HTTPS" : null,
    vercelProjectName: t.vercelProjectName, vercelDeploymentUrl: null, customDomain: t.customDomain,
    lastError: null, updatedAt: "2026-10-02T00:00:00.000Z" })) };
}
export function validateState(value: unknown): State {
  if (!value || typeof value !== "object") throw new Error("Invalid deployment state; refusing to reset checkpoints.");
  const state = value as State;
  const manifest = loadManifest();
  if (state.version !== 1 || !Array.isArray(state.templates) || state.templates.length !== manifest.length) throw new Error("Invalid deployment state schema.");
  const fields = new Set(["id", "theme", "status", "lastSuccessfulStage", "vercelProjectName", "vercelDeploymentUrl", "customDomain", "lastError", "updatedAt", "projectId", "accountId", "deploymentStartedAt", "projectCreationStartedAt"]);
  state.templates.forEach((entry, i) => {
    const t = manifest[i];
    if (!entry || Object.keys(entry).some(k => !fields.has(k)) || entry.id !== t.id || entry.theme !== t.theme || entry.vercelProjectName !== t.vercelProjectName || entry.customDomain !== t.customDomain ||
        !statuses.includes(entry.status) || (entry.lastSuccessfulStage !== null && !stageNames.includes(entry.lastSuccessfulStage as typeof stageNames[number])) ||
        (entry.lastError !== null && typeof entry.lastError !== "string") || !Number.isFinite(Date.parse(entry.updatedAt)) ||
        (entry.vercelDeploymentUrl !== null && !/^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/.test(entry.vercelDeploymentUrl)) ||
        (entry.projectId !== undefined && !/^prj_[a-zA-Z0-9_-]+$/.test(entry.projectId)) ||
        (entry.accountId !== undefined && !/^[a-zA-Z0-9_-]+$/.test(entry.accountId)) ||
        (!!entry.projectId !== !!entry.accountId) ||
        ([entry.deploymentStartedAt, entry.projectCreationStartedAt].some(v => v !== undefined && !Number.isFinite(Date.parse(v)))) ||
        (t.existingDeployment && (entry.status !== "ready" || entry.lastSuccessfulStage !== "HTTPS")) ||
        (!t.existingDeployment && ["deployed", "domain-configured", "ready"].includes(entry.status) && (!entry.projectId || !entry.vercelDeploymentUrl))) {
      throw new Error(`Invalid or unsafe deployment state for ${t.id}; refusing to reset it.`);
    }
  });
  return state;
}
function ordinary(path: string): void {
  if (existsSync(path) && (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink())) throw new Error("State path must be an ordinary file.");
}
export function loadState(path: string): State {
  ordinary(path);
  return existsSync(path) ? validateState(JSON.parse(readFileSync(path, "utf8"))) : initialState();
}
export function saveState(path: string, state: State): void {
  validateState(state); ordinary(path);
  const temp = `${path}.${process.pid}.tmp`;
  const fd = openSync(temp, "wx", 0o600);
  try { writeFileSync(fd, JSON.stringify(state, null, 2) + "\n"); fsyncSync(fd); }
  finally { closeSync(fd); }
  try {
    renameSync(temp, path);
    const parent = openSync(dirname(path), "r");
    try { fsyncSync(parent); } finally { closeSync(parent); }
  } finally { if (existsSync(temp)) unlinkSync(temp); }
}
// A OS process lock prevents concurrent single/bulk runs from racing DNS/project creation.
export function acquireLock(path: string): () => void {
  try {
    const fd = openSync(path, "wx", 0o600);
    try { writeFileSync(fd, String(process.pid)); fsyncSync(fd); } finally { closeSync(fd); }
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
    ordinary(path);
    const pid = Number(readFileSync(path, "utf8"));
    if (!Number.isInteger(pid) || pid < 1) throw new Error("Invalid deployment lock; inspect it manually.");
    try { process.kill(pid, 0); } catch (e) {
      if (e instanceof Error && "code" in e && e.code === "ESRCH") { unlinkSync(path); return acquireLock(path); }
    }
    throw new Error("Another deployment process is active; no changes were attempted.");
  }
  return () => { if (readFileSync(path, "utf8") === String(process.pid)) unlinkSync(path); };
}
export function entryFor(state: State, template: Template): Entry {
  const entry = state.templates.find(t => t.id === template.id);
  if (!entry) throw new Error("Template missing from state.");
  return entry;
}
