// Standalone Node tooling: never import this module into the application.
import { loadManifest } from "./manifest";
import { discoverCandidateThemes } from "./shared";

function discover(): void {
  const manifest = loadManifest();
  const { candidateThemes, repositories, allPrivateRepos, excludedVariants, excludedNonThemes } = discoverCandidateThemes();
  const accessible = new Map(repositories.map((repository) => [repository.full_name.toLowerCase(), repository]));
  const registered = new Set(manifest.map((theme) => theme.repository.toLowerCase()));
  const existing = manifest.filter((theme) => accessible.has(theme.repository.toLowerCase()));
  const missing = manifest.filter((theme) => !accessible.has(theme.repository.toLowerCase()));
  const newCandidates = candidateThemes.filter((theme) => !registered.has(theme.full_name.toLowerCase()));
  const themeWidth = Math.max(5, ...manifest.map((theme) => theme.theme.length), ...newCandidates.map((theme) => theme.name.length));
  const repositoryWidth = Math.max(10, ...manifest.map((theme) => theme.repository.length));
  console.log("Permanent manifest reconciliation (IDs never reassigned):\n");
  console.log(`ID    ${"THEME".padEnd(themeWidth)}   ${"REPOSITORY".padEnd(repositoryWidth)}   STATUS`);
  for (const theme of manifest) {
    const repository = accessible.get(theme.repository.toLowerCase());
    const status = repository ? repository.private ? "PRESENT (private)" : "PRESENT (public; not eligible for deployment)" : "MISSING / NOT ACCESSIBLE";
    console.log(`${theme.id}   ${theme.theme.padEnd(themeWidth)}   ${theme.repository.padEnd(repositoryWidth)}   ${status}`);
  }
  console.log("\nNew candidate themes not in the manifest (no IDs assigned):");
  if (!newCandidates.length) console.log("(none)");
  for (const theme of newCandidates) console.log(`---   ${theme.name.padEnd(themeWidth)}   ${theme.full_name}`);
  console.log(`\nAll Lexington private repos: ${allPrivateRepos}`);
  console.log(`Excluded variant repos: ${excludedVariants}`);
  console.log(`Excluded known non-theme repos: ${excludedNonThemes}`);
  console.log(`Candidate base themes: ${candidateThemes.length}`);
  console.log(`Manifest themes present on GitHub: ${existing.length}`);
  console.log(`Manifest themes missing / not accessible: ${missing.length}`);
  console.log(`New candidate themes not in manifest: ${newCandidates.length}`);
  console.log("Missing means unavailable to the authenticated account; it does not prove a repository was deleted.");
}

try {
  discover();
} catch (error: unknown) {
  console.error(`Template discovery failed: ${error instanceof Error ? error.message : "Unexpected discovery failure."}`);
  process.exitCode = 1;
}
