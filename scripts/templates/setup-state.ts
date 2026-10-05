// Separate from the historical clone deployment state; contains no credentials.
import { closeSync, existsSync, fsyncSync, lstatSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { loadManifest } from "./manifest";
export { acquireLock } from "./state";
export const setupStatuses = ["pending", "project-created", "git-connected", "deploying", "deployed", "domain-configured", "ready", "failed"] as const;
export type SetupStatus = typeof setupStatuses[number];
export interface SetupEntry {
  id: string; theme: string; projectName: string; rootDirectory: string; customDomain: string;
  status: SetupStatus; projectId?: string; accountId?: string; deploymentId?: string; deploymentUrl?: string;
  lastSuccessfulStage: string | null; lastError: string | null; updatedAt: string;
  deploymentRequestedAt?: string; projectRequestedAt?: string; deploymentSettings?: string; needsDeployment?: boolean;
}
export interface SetupState { version: 1; accountId?: string; templates: SetupEntry[] }
export const protectedId = (id: string) => id === "001" || id === "002";
export function initialSetupState(): SetupState {
  return { version: 1, templates: loadManifest().map(t => ({ id: t.id, theme: t.theme, projectName: t.vercelProjectName,
    rootDirectory: t.libraryDirectory, customDomain: t.customDomain, status: protectedId(t.id) ? "ready" : "pending",
    lastSuccessfulStage: protectedId(t.id) ? "HTTPS" : null, lastError: null, updatedAt: new Date().toISOString() })) };
}
const allowed = new Set(["id", "theme", "projectName", "rootDirectory", "customDomain", "status", "projectId", "accountId", "deploymentId", "deploymentUrl", "lastSuccessfulStage", "lastError", "updatedAt", "deploymentRequestedAt", "projectRequestedAt", "deploymentSettings", "needsDeployment"]);
export function validateSetupState(value: unknown): SetupState {
  if (!value || typeof value !== "object") throw new SetupError("Invalid setup state; refusing to reset checkpoints.");
  const state = value as SetupState;
  const manifest = loadManifest();
  if (Object.keys(state).some(k => !["version", "accountId", "templates"].includes(k)) || state.version !== 1 || !Array.isArray(state.templates) || state.templates.length !== manifest.length ||
      (state.accountId !== undefined && !/^[a-zA-Z0-9_-]+$/.test(state.accountId))) throw new SetupError("Invalid setup state schema.");
  state.templates.forEach((entry, i) => {
    const t = manifest[i];
    if (!entry || Object.keys(entry).some(k => !allowed.has(k)) || entry.id !== t.id || entry.theme !== t.theme || entry.projectName !== t.vercelProjectName || entry.rootDirectory !== t.libraryDirectory || entry.customDomain !== t.customDomain ||
        !setupStatuses.includes(entry.status) || !Number.isFinite(Date.parse(entry.updatedAt)) ||
        (entry.lastError !== null && (typeof entry.lastError !== "string" || entry.lastError.length > 1200)) ||
        (entry.lastSuccessfulStage !== null && !["Project", "Git connection", "Root directory", "Production deploy", "Domain", "DNS", "Domain verification", "HTTPS"].includes(entry.lastSuccessfulStage)) ||
        (entry.projectId !== undefined && !/^prj_[a-zA-Z0-9_-]+$/.test(entry.projectId)) ||
        (entry.accountId !== undefined && (!/^[a-zA-Z0-9_-]+$/.test(entry.accountId) || entry.accountId !== state.accountId)) ||
        (!!entry.projectId !== !!entry.accountId) ||
        (entry.deploymentId !== undefined && !/^(dpl_|dep_)[a-zA-Z0-9_-]+$/.test(entry.deploymentId)) ||
        (entry.deploymentUrl !== undefined && !/^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/.test(entry.deploymentUrl)) ||
        ([entry.deploymentRequestedAt, entry.projectRequestedAt].some(v => v !== undefined && !Number.isFinite(Date.parse(v)))) ||
        (entry.needsDeployment !== undefined && typeof entry.needsDeployment !== "boolean") ||
        (entry.deploymentSettings !== undefined && (typeof entry.deploymentSettings !== "string" || entry.deploymentSettings.length > 1000)) ||
        (protectedId(t.id) && (entry.status !== "ready" || entry.lastSuccessfulStage !== "HTTPS" || entry.lastError !== null)) ||
        (!protectedId(t.id) && ["deployed", "domain-configured", "ready"].includes(entry.status) && (!entry.projectId || !entry.deploymentId || !entry.deploymentUrl))) {
      throw new SetupError(`Invalid setup checkpoint for ${t.id}; refusing to reset it.`);
    }
  });
  return state;
}
function ordinary(path: string): void {
  if (existsSync(path) && (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink())) throw new SetupError("Setup state must be an ordinary file.");
}
export function loadSetupState(path: string): SetupState {
  ordinary(path); return existsSync(path) ? validateSetupState(JSON.parse(readFileSync(path, "utf8"))) : initialSetupState();
}
function writeSetupState(path: string, state: SetupState): void {
  validateSetupState(state); ordinary(path);
  const temp = `${path}.${process.pid}.tmp`;
  const fd = openSync(temp, "wx", 0o600);
  try {
    try { writeFileSync(fd, JSON.stringify(state, null, 2) + "\n"); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temp, path);
    const parent = openSync(dirname(path), "r"); try { fsyncSync(parent); } finally { closeSync(parent); }
  } finally { if (existsSync(temp)) unlinkSync(temp); }
}
export function saveSetupState(path: string, state: SetupState): void {
  try { writeSetupState(path, state); }
  catch { throw new SetupPersistenceError("Unable to atomically save setup state. Stop and inspect filesystem/checkpoints before resuming."); }
}
// Provider error bodies never enter state. Only locally authored messages are kept.
export class SetupError extends Error {}
export class SetupPersistenceError extends SetupError {}
export function setupErrorMessage(error: unknown): string {
  if (!(error instanceof SetupError)) return "External inspection/request failed; private response suppressed. Check provider access and retained project state before retrying.";
  return error.message.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").slice(0, 1200);
}
