import { SetupError } from "./setup-state";

// Apply before truncation so a truncated header/key-value cannot expose a secret.
export function sanitizeDiagnostic(value: unknown): string {
  if (typeof value !== "string") return "No error description returned.";
  let text = value.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
  for (const [key, secret] of Object.entries(process.env)) {
    if (secret && /token|secret|password|credential|api_?key|private_?key|godaddy_pat/i.test(key)) {
      text = text.split(secret).join("[REDACTED]").split(encodeURIComponent(secret)).join("[REDACTED]");
    }
  }
  text = text
    .replace(/^.*(?:authorization|proxy-authorization|set-cookie|cookie)\s*[=:].*$/gim, "[REDACTED AUTH HEADER]")
    .replace(/--(?:token|password|secret|credential|api-key)\s+(?:"[^"\n]*"|'[^'\n]*'|[^\s,;]+)/gi, "[REDACTED CREDENTIAL FLAG]")
    .replace(/\b(?:Bearer|Basic|sso-key)\s+[^\s,;]+/gi, "[REDACTED CREDENTIAL]")
    .replace(/(["']?(?:[a-z_]*token|[a-z_]*secret|[a-z_]*password|[a-z_]*credential|api[_-]?key|private[_-]?key|godaddy[_-]?pat)["']?\s*[=:]\s*)(?:"[^"\n]*"|'[^'\n]*'|[^\s,;}]+)/gi, "$1[REDACTED]")
    .replace(/\b(?:gh[pousr]_[a-zA-Z0-9_]+|github_pat_[a-zA-Z0-9_]+|vcp_[a-zA-Z0-9_]+|vc_[a-zA-Z0-9_]+)\b/g, "[REDACTED CREDENTIAL]")
    .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/g, "$1[REDACTED]@")
    .replace(/([?&](?:token|key|secret|password|signature|credential)=)[^&#\s]*/gi, "$1[REDACTED]")
    .replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, "[REDACTED CREDENTIAL]")
    .replace(/\b[a-zA-Z0-9_-]{24,}\b/g, value => /^(?:prj_|team_|dpl_|dep_)[a-zA-Z0-9_-]+$/.test(value) ? value : "[REDACTED LONG VALUE]")
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ");
  return text.trim().slice(0, 700) || "No error description returned.";
}
export function operationForRequest(path: string, method = "GET"): string {
  const route = path.split("?")[0];
  if (route === "/v2/user") return "AUTH_USER";
  if (route.startsWith("/v2/teams/")) return "SCOPE_INSPECT";
  if (route.endsWith("/integrations/git-namespaces")) return "GIT_NAMESPACE_INSPECT";
  if (route.endsWith("/integrations/search-repo")) return "GIT_REPOSITORY_INSPECT";
  if (route.includes("/integrations/")) return "GIT_INTEGRATION_INSPECT";
  if (/\/deployments(?:\/|$)/.test(route)) return method === "POST" ? "DEPLOYMENT" : "DEPLOYMENT_INSPECT";
  if (route.includes("/domains/")) {
    if (route.endsWith("/verify")) return "DOMAIN_VERIFY";
    if (route.endsWith("/config")) return "DOMAIN_CONFIG_INSPECT";
    return "DOMAIN_INSPECT";
  }
  if (route.endsWith("/domains")) return method === "POST" ? "DOMAIN_ASSIGNMENT" : "DOMAIN_INSPECT";
  if (/^\/v\d+\/projects$/.test(route) && method === "POST") return "PROJECT_CREATE";
  if (method === "PATCH" && route.includes("/projects/")) return "PROJECT_CONFIG";
  if (route.includes("/projects/")) return "PROJECT_INSPECT";
  return "VERCEL_API";
}
export class VercelOperationError extends SetupError {
  constructor(public readonly operation: string, message: string, public readonly status?: number, public readonly cliStatus?: number | null) {
    super(`${operation}_FAILED | HTTP: ${status ?? "unavailable"} | CLI exit: ${cliStatus ?? "unavailable"} | ${sanitizeDiagnostic(message)}`);
  }
}
export class VercelApiError extends VercelOperationError {
  constructor(status: number, public readonly code?: string, operation = "VERCEL_API", message = "Inspect account access and retained project state before retrying.", cliStatus?: number | null) {
    super(operation, `${code ? `${code}: ` : ""}${message}`, status, cliStatus);
  }
}
export function cliErrorDescription(stdout: string, stderr: string): string {
  // Select only error descriptions, never complete CLI output or HTTP headers.
  const combined = `${stderr}\n${stdout}`.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
  const descriptions = combined.split(/\r?\n/).filter(line => /(?:^|\s)(?:error|failed|invalid|unknown|cannot|unable|permission|forbidden|unauthorized)\b/i.test(line));
  return sanitizeDiagnostic(descriptions.slice(-3).join("; ") || "CLI failed without an error description. Check the installed Vercel CLI version, login and selected scope.");
}
