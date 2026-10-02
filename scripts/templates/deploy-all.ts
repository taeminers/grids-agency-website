// Planning only. Do not import or invoke the live deployment implementation.
import { loadManifest } from "./manifest";

try {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] !== "--dry-run") {
    throw new Error("Bulk live deployment has not been enabled yet. Require --dry-run: npm run templates:deploy-all -- --dry-run");
  }
  const templates = loadManifest();
  console.log("GRIDS TEMPLATE BULK DRY RUN\nNo cloning, installation, builds, Vercel changes, or DNS changes.\n");
  console.log(`${"ID".padEnd(5)}${"THEME".padEnd(17)}${"REPOSITORY".padEnd(35)}${"VERCEL PROJECT".padEnd(19)}CUSTOM DOMAIN (metadata only)`);
  for (const template of templates) {
    console.log(`${template.id.padEnd(5)}${template.theme.padEnd(17)}${template.repository.padEnd(35)}${template.vercelProjectName.padEnd(19)}${template.customDomain}`);
  }
  console.log(`\nManifest templates: ${templates.length}`);
  console.log(`Existing deployments protected: ${templates.filter((template) => template.existingDeployment).length}`);
  console.log("Template 001 is already live and would be skipped; its project and domain remain untouched.");
  console.log("For each remaining template, the future single-deploy workflow would clone into a unique temporary directory, inspect the package/lockfile, install, build locally, then create/link/verify its own demo project and deploy --prod. Each run would clean its own directory on success or failure.");
  console.log("Custom domains are metadata only. No domain assignment or DNS changes are planned. Bulk live execution is disabled.");
} catch (error: unknown) {
  console.error(`Template bulk planning failed: ${error instanceof Error ? error.message : "Unexpected failure."}`);
  process.exitCode = 1;
}
