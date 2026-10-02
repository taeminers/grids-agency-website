// Shared secure, in-memory GoDaddy PAT loading and response redaction.
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export function loadToken(envFile: string): string {
  if (typeof parseEnv !== "function") throw new Error("GoDaddy tooling requires Node.js 20.12 or later to read .env.local securely.");
  let token: string | undefined;
  try {
    // Parse in memory only. Do not populate process.env or load other env files.
    token = parseEnv(readFileSync(envFile, "utf8")).GODADDY_PAT?.trim();
  } catch {
    throw new Error("Unable to read .env.local. Add GODADDY_PAT to that file and check its permissions.");
  }
  if (!token) throw new Error("GODADDY_PAT is missing or empty in .env.local. Add it before running GoDaddy tooling.");
  if (/\s/.test(token)) throw new Error("GODADDY_PAT contains whitespace and cannot be used. Check its value in .env.local; it was not printed.");
  return token;
}

export function safeText(value: string, token: string): string {
  return value.split(token).join("[REDACTED]")
    .split(encodeURIComponent(token)).join("[REDACTED]")
    .replace(/authorization[^\r\n]*/gi, "[REDACTED AUTH HEADER]")
    .replace(/\bBearer\s+\S+/gi, "[REDACTED AUTH HEADER]")
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
    );
}

export function apiMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "The API returned an unsuccessful response.";
  const error = body as Record<string, unknown>;
  const nested = error.error && typeof error.error === "object" ? error.error as Record<string, unknown> : {};
  // Select only documented error descriptions; never dump a response or headers.
  const code = error.code ?? nested.code;
  const message = error.message ?? error.detail ?? nested.message ?? error.title;
  const pieces = [code, message].filter((value): value is string => typeof value === "string" && value.length > 0);
  return pieces.join(": ") || "The API returned an unsuccessful response.";
}

