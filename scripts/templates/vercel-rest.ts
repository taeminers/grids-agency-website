import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { VercelApiError, VercelOperationError, operationForRequest } from "./vercel-errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Provider JSON is checked at API/auth boundaries.
type Json = Record<string, any>;
// Native CLI requests can retry writes and suppress non-2xx HTTP headers.
// REST preserves status/body and performs exactly one fetch, with no redirects.
export async function vercelRequest(path: string, method: "GET" | "POST" | "PATCH", body: object | undefined,
  token: string, fetcher: typeof fetch = fetch): Promise<Json> {
  const operation = operationForRequest(path, method);
  if (!/^\/v\d+\/[a-zA-Z0-9_/?=&.%+-]+$/.test(path)) throw new VercelOperationError(operation, "Invalid API path.");
  let response: Response;
  try {
    response = await fetcher(`https://api.vercel.com${path}`, {
      method, redirect: "manual", signal: AbortSignal.timeout(60_000),
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch { throw new VercelOperationError(operation, "Network request failed or timed out; outcome may be uncertain. No automatic write retry."); }
  let data: Json;
  try { data = await response.json() as Json; }
  catch {
    if (!response.ok) throw new VercelApiError(response.status, undefined, operation, "Request rejected; non-JSON private response suppressed. No automatic write retry.");
    throw new VercelOperationError(operation, "Invalid JSON response; private response suppressed. No automatic write retry.", response.status);
  }
  if (!response.ok) {
    const code = typeof data?.error?.code === "string" ? data.error.code.split(token).join("[REDACTED]") : undefined;
    throw new VercelApiError(response.status, code, operation, typeof data?.error?.message === "string" ? data.error.message.split(token).join("[REDACTED]") : "Request rejected; no automatic write retry.");
  }
  if (!data || typeof data !== "object" || data.error) throw new VercelOperationError(operation, "Invalid API response; private response suppressed.", response.status);
  return data;
}

export function authenticatedRest(scope?: string): (path: string, method?: "GET" | "POST" | "PATCH", body?: object) => Promise<Json> {
  // Use the same on-disk login as Vercel CLI. Never accept ambient token overrides,
  // print credentials, pass tokens to a subprocess, or persist/refresh login here.
  let session: Promise<{ token: string; teamId?: string }> | undefined;
  const load = async () => {
    const home = homedir();
    const directories = [join(home, "Library/Application Support/com.vercel.cli"),
      join(process.env.XDG_DATA_HOME || join(home, ".local/share"), "com.vercel.cli"),
      join(home, ".config/vercel"), join(home, ".vercel")];
    const directory = directories.find(dir => existsSync(join(dir, "auth.json")));
    let auth: Json, config: Json;
    try {
      if (!directory) throw new Error();
      auth = JSON.parse(readFileSync(join(directory, "auth.json"), "utf8"));
      config = existsSync(join(directory, "config.json")) ? JSON.parse(readFileSync(join(directory, "config.json"), "utf8")) : {};
      if (typeof auth.token !== "string" || !auth.token || (typeof auth.expiresAt === "number" && auth.expiresAt <= Date.now() / 1000)) throw new Error();
    } catch { throw new VercelOperationError("AUTH_USER", "Vercel CLI login is missing, expired or unreadable. Run vercel login separately, then retry."); }
    let teamId = typeof config.currentTeam === "string" ? config.currentTeam : undefined;
    if (scope) {
      const result = await vercelRequest("/v2/teams?limit=100", "GET", undefined, auth.token);
      const team = Array.isArray(result.teams) && result.teams.find((team: Json) => team.id === scope || team.slug === scope);
      if (!team || typeof team.id !== "string") throw new VercelOperationError("SCOPE_INSPECT", "Requested team scope could not be verified; no writes attempted.");
      teamId = team.id;
    }
    return { token: auth.token as string, teamId };
  };
  return async (path, method = "GET", body) => {
    const auth = await (session ??= load());
    const url = new URL(path, "https://api.vercel.com");
    if (auth.teamId && !url.searchParams.has("teamId")) url.searchParams.set("teamId", auth.teamId);
    return vercelRequest(`${url.pathname}${url.search}`, method, body, auth.token);
  };
}
