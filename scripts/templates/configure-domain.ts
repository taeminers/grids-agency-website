// Shared domain automation: legacy 002 mode and manifest-guarded permanent setup. No deletes, replacements or domain moves.
import { retryRead } from "./read-retry";
import { resolveTemplate, Template } from "./manifest";
import { SetupError } from "./setup-state";
import { loadToken, safeText } from "./godaddy";

export type DomainStage = "Domain assignment" | "GoDaddy DNS" | "Domain verification";
export interface DomainOptions {
  template: Template;
  projectId: string;
  accountId: string;
  envFile: string;
  api: (path: string, method: "GET" | "POST", body?: object) => Promise<unknown>;
  status: (stage: DomainStage, value: string) => void;
  fetchImpl?: typeof fetch;
  log?: (message: string) => void;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  dryRun?: boolean;
  preserveExisting?: boolean;
  librarySetup?: boolean;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || "error" in value) {
    throw new SetupError("Vercel returned an unexpected or unsuccessful response. No unsafe fallback was attempted.");
  }
  return value as Record<string, unknown>;
}

export function domainHostname(template: Template, preserveExisting = false, librarySetup = false): string {
  const expected = resolveTemplate(template.id);
  const enabled = librarySetup ? Number(template.id) >= 3 && Number(template.id) <= 51 : template.id === "002";
  if (!enabled || (template.existingDeployment && !preserveExisting) ||
      template.theme !== expected.theme || template.libraryDirectory !== expected.libraryDirectory ||
      template.repository !== expected.repository || template.vercelProjectName !== expected.vercelProjectName ||
      template.customDomain !== expected.customDomain || template.customDomain !== `demo-${template.id}.gridsagency.com`) {
    throw new SetupError("Domain configuration refused a protected ID or a mapping outside the exact selected manifest entry.");
  }
  const hostname = template.customDomain.slice(0, -".gridsagency.com".length);
  if (hostname !== `demo-${template.id}`) {
    throw new SetupError("Refused an unsafe GoDaddy hostname.");
  }
  return hostname;
}

export function recommendedTarget(config: unknown, domain: string): string {
  const recommendations = object(config).recommendedCNAME;
  if (!Array.isArray(recommendations)) throw new SetupError("Vercel supplied no recommended CNAME. DNS was not changed.");
  const preferred = recommendations.filter((entry) => entry && typeof entry === "object" && entry.rank === 1);
  const values = [...new Set(preferred.map((entry) => entry.value))];
  if (values.length !== 1 || typeof values[0] !== "string") throw new SetupError("Vercel's preferred CNAME is missing or ambiguous. DNS was not changed.");
  const target = values[0];
  const normalized = target.toLowerCase().replace(/\.$/, "");
  if (normalized.length > 253 || normalized === domain.toLowerCase() || !normalized.includes(".") ||
      !normalized.split(".").every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) || /^\d+(?:\.\d+){3}$/.test(normalized)) {
    throw new SetupError("Vercel supplied an invalid CNAME hostname. DNS was not changed.");
  }
  return target; // Preserve the exact Vercel value; never reuse demo-001's target.
}
const canonical = (value: string) => value.toLowerCase().replace(/\.$/, "");
interface RecordValue { type: string; name: string; data: string; ttl: number }

export async function configureDomain(options: DomainOptions): Promise<"SUCCESS" | "PENDING"> {
  const hostname = domainHostname(options.template, options.preserveExisting, options.librarySetup);
  const { template, projectId, accountId, status } = options;
  const attempts = options.attempts ?? 6;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 6) throw new SetupError("Domain polling attempts must be between 1 and 6.");
  if (!/^prj_[a-zA-Z0-9_-]+$/.test(projectId) || !/^[a-zA-Z0-9_-]+$/.test(accountId)) throw new SetupError("Invalid Vercel project identity.");
  const log = options.log ?? console.log;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const api: DomainOptions["api"] = (path, method, body) => method === "GET"
    ? retryRead(() => options.api(path, method, body), sleep) : options.api(path, method, body);
  const scope = accountId.startsWith("team_") ? `teamId=${encodeURIComponent(accountId)}` : "";
  const scoped = (path: string) => scope ? `${path}${path.includes("?") ? "&" : "?"}${scope}` : path;
  const project = object(await api(scoped(`/v9/projects/${projectId}`), "GET"));
  if (project.id !== projectId || project.name !== template.vercelProjectName || project.accountId !== accountId) {
    throw new SetupError("Vercel project/account does not match the selected manifest entry. Domain and DNS were not changed.");
  }
  // Load only in this opt-in path, after deployment. Never pass the PAT to CLI,
  // install/build environments, request files, or frontend configuration.
  const token = loadToken(options.envFile);
  const fetchImpl = options.fetchImpl ?? fetch;
  const dnsEndpoint = "https://api.godaddy.com/v3/domains/zones/gridsagency.com/dns-records";
  async function godaddyOnce(method: "GET" | "POST", page = 1, body?: RecordValue): Promise<unknown> {
    if (domainHostname(template, options.preserveExisting, options.librarySetup) !== hostname) throw new SetupError("DNS hostname changed; refusing request.");
    const url = new URL(dnsEndpoint);
    if (method === "GET") url.search = new URLSearchParams({ name: hostname, page: String(page), pageSize: "100", totalRequired: "true" }).toString();
    if (options.dryRun && method !== "GET") throw new SetupError("Dry run refused a DNS write.");
    if (method === "POST" && (!body || body.name !== hostname || body.type !== "CNAME")) throw new SetupError("Refused a DNS write outside the exact template CNAME.");
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method, redirect: "error", signal: AbortSignal.timeout(30_000),
        headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new SetupError("GoDaddy network request failed or timed out. No automatic write retry or rollback was attempted; inspect the selected demo before retrying.");
    }
    const text = await response.text().catch(() => "");
    let value: unknown;
    try { value = text ? JSON.parse(text) : undefined; } catch {
      throw Object.assign(new SetupError(`GoDaddy API HTTP ${response.status}: Invalid JSON response. No automatic write retry was attempted.`), { status: response.status });
    }
    if (!response.ok) throw Object.assign(new SetupError(`GoDaddy API HTTP ${response.status}: Request rejected; private response suppressed.`), { status: response.status });
    return value;
  }
  const godaddy = (method: "GET" | "POST", page = 1, body?: RecordValue) => method === "GET"
    ? retryRead(() => godaddyOnce(method, page, body), sleep) : godaddyOnce(method, page, body);
  async function existing(): Promise<RecordValue[]> {
    const records: RecordValue[] = [];
    let total: number | undefined;
    for (let page = 1; page <= 100; page += 1) {
      const data = object(await godaddy("GET", page));
      if (!Array.isArray(data.items)) throw new SetupError("Unexpected GoDaddy DNS response. No write attempted.");
      for (const entry of data.items) {
        if (!entry || typeof entry !== "object" || entry.name !== hostname || typeof entry.type !== "string" ||
            typeof entry.data !== "string" || !Number.isInteger(entry.ttl) || entry.ttl < 0) {
          throw new SetupError("GoDaddy returned unexpected records or a different hostname. No write attempted.");
        }
        records.push(entry);
      }
      if (data.totalItems !== undefined) {
        if (!Number.isInteger(data.totalItems) || (data.totalItems as number) < 0 || (total !== undefined && total !== data.totalItems)) throw new SetupError("GoDaddy DNS count is inconsistent. No write attempted.");
        total = data.totalItems as number;
      }
      const next = data.totalPages !== undefined
        ? Number.isInteger(data.totalPages) && (data.totalPages as number) > page
        : Array.isArray(data.links) ? data.links.some((link) => link?.rel === "next") : data.items.length === 100;
      if (data.totalPages !== undefined && (!Number.isInteger(data.totalPages) || (data.totalPages as number) < 0)) throw new SetupError("GoDaddy DNS pagination is invalid. No write attempted.");
      if (!next) {
        if (total !== undefined && total !== records.length) throw new SetupError("Incomplete GoDaddy DNS results. No write attempted.");
        return records;
      }
      if (!data.items.length) throw new SetupError("Empty GoDaddy intermediate page. No write attempted.");
    }
    throw new SetupError("GoDaddy DNS pagination exceeded the safety limit. No write attempted.");
  }
  const domainPath = scoped(`/v9/projects/${projectId}/domains/${encodeURIComponent(template.customDomain)}`);
  const domainConfigPath = scoped(`/v6/domains/${encodeURIComponent(template.customDomain)}/config?projectIdOrName=${projectId}`);
  function checkAssignment(value: unknown) {
    const assignment = object(value);
    if (assignment.name !== template.customDomain || assignment.projectId !== projectId ||
        assignment.redirect || assignment.gitBranch || assignment.customEnvironmentId) {
      throw new SetupError("Vercel domain is not assigned to this exact project's production deployment. DNS changes stopped.");
    }
    return assignment;
  }
  status("Domain assignment", "IN PROGRESS");
  if (options.preserveExisting || options.dryRun) {
    const domains = object(await api(scoped(`/v9/projects/${projectId}/domains`), "GET"));
    if (!Array.isArray(domains.domains)) throw new SetupError("Unexpected domain list; no write attempted.");
    if (!domains.domains.some((entry) => entry?.name === template.customDomain)) {
      if (options.dryRun) log(`PLAN: attach ${template.customDomain} to ${projectId}; never move a domain from another project.`);
      else {
        try { checkAssignment(await api(scoped(`/v10/projects/${projectId}/domains`), "POST", { name: template.customDomain })); }
        catch (error) {
          // A lost response may conceal a successful attachment. Never move a domain.
          const current = object(await api(scoped(`/v9/projects/${projectId}/domains`), "GET"));
          if (!Array.isArray(current.domains) || !current.domains.some(entry => entry?.name === template.customDomain)) throw error;
          checkAssignment(await api(domainPath, "GET"));
        }
      }
    } else checkAssignment(await api(domainPath, "GET"));
  } else {
    checkAssignment(await api(scoped(`/v10/projects/${projectId}/domains`), "POST", { name: template.customDomain }));
    checkAssignment(await api(domainPath, "GET"));
  }
  status("Domain assignment", "SUCCESS");
  status("GoDaddy DNS", "IN PROGRESS");
  const initialConfig = object(await api(domainConfigPath, "GET"));
  const target = recommendedTarget(initialConfig, template.customDomain);
  const intended = { type: "CNAME", name: hostname, data: target, ttl: 600 };
  const identical = (entries: RecordValue[]) => entries.length === 1 && entries[0].type === "CNAME" &&
    (canonical(entries[0].data) === canonical(target) || (options.preserveExisting === true && !options.librarySetup && initialConfig.misconfigured === false));
  let entries = await existing();
  log(`\nExisting GoDaddy records for ${hostname}:`);
  if (!entries.length) log("(none)");
  for (const entry of entries) log(safeText(`${entry.type}  ${entry.name}  ${entry.data}  TTL ${entry.ttl}`, token));
  log(safeText(`Intended CNAME: ${hostname} → ${target} (TTL 600)`, token));
  if (entries.length && !identical(entries)) throw new SetupError(`Unexpected existing DNS record(s) at ${hostname}. Refusing to overwrite, replace, or delete anything.`);
  if (options.dryRun) {
    log(entries.length ? "DNS already valid; preserve existing record and TTL." : `PLAN: create only the missing ${hostname} CNAME.`);
    status("GoDaddy DNS", entries.length ? "SUCCESS" : "PLANNED");
    status("Domain verification", initialConfig.misconfigured === false ? "SUCCESS" : "PENDING");
    return initialConfig.misconfigured === false ? "SUCCESS" : "PENDING";
  }
  if (!entries.length) {
    // Re-read immediately before the single create. Never POST blindly after a
    // stale read, and never PUT a zone/type record set or replace another record.
    entries = await existing();
    if (entries.length && !identical(entries)) throw new SetupError("DNS changed before the write. Refusing to overwrite existing records.");
    if (!entries.length) {
      try { await godaddy("POST", 1, intended); }
      catch (error) {
        // Inspect after an uncertain write. If absent, stop and let the next
        // explicit run inspect again before creating; never repeat blindly.
        const current = await existing();
        if (!identical(current)) {
          if (current.length) throw new SetupError("Conflicting DNS appeared after the write. No overwrite or retry performed.");
          throw error;
        }
        log("DNS write response unavailable; exact CNAME confirmed by readback.");
      }
    }
    if (!identical(await existing())) throw new SetupError("GoDaddy did not confirm the intended unique CNAME. No retry, replacement, or rollback was attempted.");
  } else log("Identical CNAME already exists; no DNS write needed.");
  status("GoDaddy DNS", "SUCCESS");
  status("Domain verification", "PENDING");
  // At most six checks / 50 seconds of polling delays. Ownership verification
  // and DNS/TLS readiness are different: require BOTH, not just verified=true.
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      let assignment = checkAssignment(await api(domainPath, "GET"));
      if (assignment.verified === false && (!Array.isArray(assignment.verification) || assignment.verification.length === 0)) {
        assignment = checkAssignment(await api(scoped(`/v9/projects/${projectId}/domains/${encodeURIComponent(template.customDomain)}/verify`), "POST"));
      }
      if (Array.isArray(assignment.verification) && assignment.verification.length) {
        log("Vercel requires an additional ownership challenge. It will not be written automatically; verification remains PENDING.");
        break;
      }
      const config = object(await api(domainConfigPath, "GET"));
      if (assignment.verified === true && config.misconfigured === false) {
        status("Domain verification", "SUCCESS");
        return "SUCCESS";
      }
    } catch {
      log("Domain verification check is not ready or unavailable; deployment and DNS are retained.");
    }
    if (attempt < attempts - 1) await sleep(10_000);
  }
  log(`Domain verification: PENDING. Deployment is retained. Retry read-only verification later with Vercel domains inspect ${template.customDomain}; no rollback performed.`);
  return "PENDING";
}
