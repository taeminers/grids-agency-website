// Deployment integration adapter; all external operations remain injectable.
import { Template } from "./manifest";
import { configureDomain as configure, DomainStage } from "./configure-domain";
export { domainHostname, recommendedTarget as cnameTarget } from "./configure-domain";

type Json = Record<string, unknown>;
export interface DomainStatus { assignment: string; dns: string; verification: string }
export interface DomainOptions {
  api: (path: string, method?: "GET" | "POST", body?: Json) => Json;
  projectId: string;
  accountId: string;
  envFile: string;
  status: DomainStatus;
  fetchImpl?: typeof fetch;
  log?: (message: string) => void;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
}
export async function configureDomain(template: Template, options: DomainOptions): Promise<void> {
  const keys: Record<DomainStage, keyof DomainStatus> = {
    "Domain assignment": "assignment", "GoDaddy DNS": "dns", "Domain verification": "verification",
  };
  options.status.assignment = "IN PROGRESS";
  try {
    await configure({
      ...options, template,
      api: async (path, method, body) => options.api(path, method, body as Json | undefined),
      status: (stage, value) => { options.status[keys[stage]] = value; },
    });
  } catch (error) {
    for (const key of Object.values(keys)) {
      if (options.status[key] === "IN PROGRESS") options.status[key] = "FAILED";
    }
    throw error;
  }
}
