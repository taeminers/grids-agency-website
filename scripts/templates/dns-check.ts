// Standalone, read-only GoDaddy access check. Never import into the frontend.
// PAT auth: https://developer.godaddy.com/en/docs/api-users/auth
// DNS read: https://developer.godaddy.com/en/docs/api-users/domains/manage/dns
import { resolve } from "node:path";
import { loadToken, safeText, apiMessage } from "./godaddy";

const domain = "gridsagency.com";
const endpoint = `https://api.godaddy.com/v3/domains/zones/${domain}/dns-records`;
interface DnsRecord { type: string; name: string; data: string; ttl: number }
interface CheckOptions {
  envFile?: string;
  fetchImpl?: typeof fetch;
  log?: (message: string) => void;
}

export function advice(status: number): string {
  switch (status) {
    case 401: return "Check that the PAT is valid, unexpired, and not revoked.";
    case 403: return "Check the PAT's domains.domain:read scope and access to this domain.";
    case 404: return "Check domain ownership and whether GoDaddy hosts the domain's DNS zone.";
    case 429: return "GoDaddy rate limit reached. Try again later.";
    default: return "Check GoDaddy service availability and try again later.";
  }
}

function isRecord(value: unknown): value is DnsRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.type === "string" && typeof record.name === "string" && typeof record.data === "string" &&
    typeof record.ttl === "number" && Number.isInteger(record.ttl) && record.ttl >= 0;
}

export async function dnsCheck(options: CheckOptions = {}): Promise<void> {
  const token = loadToken(options.envFile ?? resolve(__dirname, "../../../.env.local"));
  const fetchImpl = options.fetchImpl ?? fetch;
  const log = options.log ?? console.log;
  const records: DnsRecord[] = [];
  let expectedTotal: number | undefined;
  for (let page = 1; ; page += 1) {
    if (page > 1_000) throw new Error("GoDaddy DNS pagination exceeded the safety limit. No records were modified.");
    // Always construct our own URL. Never follow API-provided links or redirects
    // that could send the PAT to a different host, path, or domain.
    const url = new URL(endpoint);
    url.search = new URLSearchParams({ page: String(page), pageSize: "100", totalRequired: "true" }).toString();
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: "GET", redirect: "error",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      // Network exceptions can include request objects/credentials; never log them.
      throw new Error("GoDaddy DNS request failed or timed out. Check connectivity; redirects are refused. No records were modified.");
    }
    let body: unknown;
    try { body = JSON.parse(await response.text()); } catch {
      throw new Error(`GoDaddy API HTTP ${response.status}: Response was not readable JSON. ${advice(response.status)}`);
    }
    if (!response.ok) {
      throw new Error(`GoDaddy API HTTP ${response.status}: ${safeText(apiMessage(body), token).slice(0, 1_000)} ${advice(response.status)}`);
    }
    if (!body || typeof body !== "object" || !Array.isArray((body as Record<string, unknown>).items)) {
      throw new Error(`GoDaddy API HTTP ${response.status}: Unexpected DNS response format.`);
    }
    const data = body as { items: unknown[]; totalItems?: unknown; totalPages?: unknown; links?: unknown };
    if (!data.items.every(isRecord)) throw new Error(`GoDaddy API HTTP ${response.status}: Unexpected DNS record format.`);
    if (data.totalItems !== undefined) {
      if (typeof data.totalItems !== "number" || !Number.isInteger(data.totalItems) || data.totalItems < 0) {
        throw new Error(`GoDaddy API HTTP ${response.status}: Invalid DNS pagination count.`);
      }
      if (expectedTotal !== undefined && expectedTotal !== data.totalItems) {
        throw new Error("DNS record count changed during pagination. Run the read-only check again for a consistent summary.");
      }
      expectedTotal = data.totalItems;
    }
    records.push(...data.items);
    let hasNext: boolean;
    if (data.totalPages !== undefined) {
      if (typeof data.totalPages !== "number" || !Number.isInteger(data.totalPages) || data.totalPages < 0) {
        throw new Error(`GoDaddy API HTTP ${response.status}: Invalid DNS page count.`);
      }
      hasNext = page < data.totalPages;
    } else if (Array.isArray(data.links)) {
      hasNext = data.links.some((link: unknown) => link && typeof link === "object" && (link as { rel?: unknown }).rel === "next");
    } else {
      hasNext = data.items.length === 100;
    }
    if (hasNext && !data.items.length) throw new Error("GoDaddy returned an empty intermediate DNS page. No partial success was reported.");
    if (!hasNext) break;
  }
  if (expectedTotal !== undefined && records.length !== expectedTotal) {
    throw new Error("GoDaddy DNS record count does not match the retrieved records. No partial success was reported; try again.");
  }
  // Nothing is printed until all pages have succeeded and validated.
  const rows = records.sort((a, b) => a.name.localeCompare(b.name, "en") || a.type.localeCompare(b.type, "en") || a.data.localeCompare(b.data, "en"))
    .map((record) => [record.type, record.name, record.data, String(record.ttl)].map((value) => safeText(value, token)));
  const widths = [4, 4, 10].map((minimum, index) => Math.max(minimum, ...rows.map((row) => row[index].length)));
  log(`${"TYPE".padEnd(widths[0])}   ${"NAME".padEnd(widths[1])}   ${"DATA/VALUE".padEnd(widths[2])}   TTL`);
  for (const row of rows) log(`${row[0].padEnd(widths[0])}   ${row[1].padEnd(widths[1])}   ${row[2].padEnd(widths[2])}   ${row[3]}`);
  if (!rows.length) log("(no DNS records returned)");
  log("\nRequested record checks:");
  for (const name of ["www", "admin", "api", "demo-001"]) {
    const matches = records.filter((record) => {
      const normalized = record.name.toLowerCase().replace(/\.$/, "");
      return normalized === name || normalized === `${name}.${domain}`;
    });
    log(`${name}: ${matches.length ? `FOUND (${matches.length} record${matches.length === 1 ? "" : "s"})` : "NOT PRESENT"}`);
  }
  log(`\nGoDaddy API: CONNECTED\nDomain: ${domain}\nDNS records: ${records.length}`);
}

if (require.main === module) {
  if (process.argv.length > 2) {
    console.error("templates:dns-check takes no arguments and reads only gridsagency.com.");
    process.exitCode = 1;
  } else {
    void dnsCheck().catch((error: unknown) => {
      console.error(`DNS check failed: ${error instanceof Error ? error.message : "Unexpected read-only DNS check failure."}`);
      process.exitCode = 1;
    });
  }
}
