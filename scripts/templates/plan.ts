import { Template } from "./manifest";

export function printPlan(template: Template, configureDomain = false): void {
  console.log(`\nID:             ${template.id}\nTheme:          ${template.theme}\nRepository:     ${template.repository}\nVercel project: ${template.vercelProjectName}\nCustom domain:  ${template.customDomain}${configureDomain ? " (configuration requested)" : " (metadata only)"}`);
  if (template.existingDeployment) {
    console.log("Plan: already live; skip cloning, installation, build, and deployment. Leave the existing project and domain untouched.");
    return;
  }
  if (configureDomain) console.log(`GoDaddy hostname that WOULD be modified: demo-${template.id}\nDomain plan: confirm selected Vercel project, assign ${template.customDomain}, obtain its exact recommended CNAME from Vercel, inspect only demo-${template.id}, stop on conflicting records, create only if absent, then poll verification for about one minute. No domain or DNS requests occur in dry-run.`);
  console.log(`Plan:\n1. Verify locally authenticated gh.\n2. Reserve a unique .tmp/templates/${template.id}-<random>/ directory.\n3. gh repo clone ${template.repository} <temporary-directory>\n4. Inspect package.json, lockfiles, framework dependencies, and Node engine.\n5. Install using the indicated lockfile: npm ci, pnpm/Bun/Yarn 1 install --frozen-lockfile, or Yarn 2+ install --immutable.\n6. Run <package-manager> run build locally; stop on failure.\n7. After build success, verify Vercel CLI authentication and create a fresh ${template.vercelProjectName} project; stop if it already exists.\n8. Link only the temporary clone and verify the new project/account IDs.\n9. vercel deploy --prod --yes (only to ${template.vercelProjectName}); print the returned vercel.app URL.\n10. Remove only this run's unique temporary directory in finally, on success or failure.\n${configureDomain ? "Domain configuration is opt-in for this selected template only, after deployment and before cleanup." : "No domain assignment or DNS changes."}`);
}
