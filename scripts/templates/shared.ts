// Standalone Node tooling: never import this module into the application.
import { execFileSync } from "node:child_process";

export interface Repository {
  id: number;
  owner: { login: string };
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  clone_url: string;
  html_url: string;
}

// Prefer locally stored credentials over unrelated tokens in the shell.
export const ghEnvironment = { ...process.env };
for (const key of ["GH_TOKEN", "GITHUB_TOKEN", "GH_ENTERPRISE_TOKEN", "GITHUB_ENTERPRISE_TOKEN"]) {
  delete ghEnvironment[key];
}
ghEnvironment.GH_PROMPT_DISABLED = "1";

export function gh(args: string[]): string {
  return execFileSync("gh", args, {
    env: ghEnvironment,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 128 * 1024 * 1024,
  });
}

export function verifyGitHubCli(): void {
  try {
    gh(["--version"]);
  } catch {
    throw new Error("GitHub CLI (gh) is unavailable. Install gh, then run: gh auth login");
  }
  try {
    gh(["auth", "status", "--hostname", "github.com"]);
  } catch {
    throw new Error("GitHub CLI is not authenticated with github.com. Run: gh auth login");
  }
}

export function discoverCandidateThemes() {
  verifyGitHubCli();

  let repositories: Repository[];
  try {
    // Slurp combines all paginated responses into an array of pages.
    const pages: unknown = JSON.parse(gh([
      "api", "--hostname", "github.com", "--method", "GET", "/user/repos",
      "-f", "per_page=100", "--paginate", "--slurp",
    ]));
    if (!Array.isArray(pages) || !pages.every(Array.isArray)) {
      throw new Error("Unexpected response shape");
    }
    repositories = pages.flat() as Repository[];
  } catch {
    // Do not forward CLI stderr, which may contain authentication information.
    throw new Error("Unable to retrieve repositories through GitHub CLI. Check your connection and GitHub access; to authenticate again, run: gh auth login");
  }

  const matching = new Map<number, Repository>();
  for (const repository of repositories) {
    if (repository.owner.login.toLowerCase() === "lexington-themes" && repository.private) {
      matching.set(repository.id, repository);
    }
  }
  let excludedVariants = 0;
  let excludedNonThemes = 0;
  const candidates = [...matching.values()].filter((repository) => {
    const name = repository.name.toLowerCase();
    if (name.endsWith("-emdash") || name.endsWith("-sanity-astro")) {
      excludedVariants += 1;
      return false;
    }
    if (name === "lexington-motion") {
      excludedNonThemes += 1;
      return false;
    }
    return true;
  });
  const sorted = candidates.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "en") ||
    a.name.localeCompare(b.name, "en") || a.id - b.id,
  );
  // Discovery never assigns IDs. The permanent manifest owns that mapping.
  const candidateThemes = sorted.map((repository) => ({
    owner: repository.owner.login,
    name: repository.name,
    full_name: repository.full_name,
    visibility: repository.private ? "private" : "public",
    default_branch: repository.default_branch,
    clone_url: repository.clone_url,
    html_url: repository.html_url,
  }));

  return { candidateThemes, allPrivateRepos: matching.size, excludedVariants, excludedNonThemes, repositories };
}
