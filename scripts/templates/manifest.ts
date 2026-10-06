// Permanent mapping captured from authenticated GitHub discovery.
// Never regenerate IDs from GitHub sort order; new entries require manual review.
export interface Template {
  readonly id: string;
  readonly theme: string;
  /** Lexington upstream source only; never the production Git source. */
  readonly repository: string;
  readonly libraryDirectory: string;
  /** Vercel Git integration source; developers still edit only the master library. */
  readonly deploymentRepository: string;
  readonly vercelProjectName: string;
  readonly customDomain: string;
  readonly existingDeployment?: boolean;
}

export const templateLibraryRepository = "taeminers/grids-template-library";

export const templateManifest: readonly Template[] = [
  { id: "001", deploymentRepository: "taeminers/grids-template-library", theme: "aelen", libraryDirectory: "templates/001-aelen", repository: "Lexington-Themes/aelen", vercelProjectName: "grids-demo-001", customDomain: "demo-001.gridsagency.com", existingDeployment: true },
  { id: "002", deploymentRepository: "taeminers/grids-template-library", theme: "alfred", libraryDirectory: "templates/002-alfred", repository: "Lexington-Themes/alfred", vercelProjectName: "grids-demo-002", customDomain: "demo-002.gridsagency.com", existingDeployment: true },
  { id: "003", deploymentRepository: "taeminers/grids-template-library", theme: "astromaxsp", libraryDirectory: "templates/003-astromaxsp", repository: "Lexington-Themes/astromaxsp", vercelProjectName: "grids-demo-003", customDomain: "demo-003.gridsagency.com" },
  { id: "004", deploymentRepository: "taeminers/grids-template-library", theme: "aubergine", libraryDirectory: "templates/004-aubergine", repository: "Lexington-Themes/aubergine", vercelProjectName: "grids-demo-004", customDomain: "demo-004.gridsagency.com" },
  { id: "005", deploymentRepository: "taeminers/grids-template-library", theme: "author", libraryDirectory: "templates/005-author", repository: "Lexington-Themes/author", vercelProjectName: "grids-demo-005", customDomain: "demo-005.gridsagency.com" },
  { id: "006", deploymentRepository: "taeminers/grids-template-library", theme: "bastion", libraryDirectory: "templates/006-bastion", repository: "Lexington-Themes/bastion", vercelProjectName: "grids-demo-006", customDomain: "demo-006.gridsagency.com" },
  { id: "007", deploymentRepository: "taeminers/grids-template-library", theme: "brightlight", libraryDirectory: "templates/007-brightlight", repository: "Lexington-Themes/brightlight", vercelProjectName: "grids-demo-007", customDomain: "demo-007.gridsagency.com" },
  { id: "008", deploymentRepository: "taeminers/grids-template-library", theme: "buio", libraryDirectory: "templates/008-buio", repository: "Lexington-Themes/buio", vercelProjectName: "grids-demo-008", customDomain: "demo-008.gridsagency.com" },
  { id: "009", deploymentRepository: "taeminers/grids-template-library", theme: "carbon", libraryDirectory: "templates/009-carbon", repository: "Lexington-Themes/carbon", vercelProjectName: "grids-demo-009", customDomain: "demo-009.gridsagency.com" },
  { id: "010", deploymentRepository: "taeminers/grids-template-library", theme: "carriera", libraryDirectory: "templates/010-carriera", repository: "Lexington-Themes/carriera", vercelProjectName: "grids-demo-010", customDomain: "demo-010.gridsagency.com" },
  { id: "011", deploymentRepository: "taeminers/grids-template-library", theme: "carrington", libraryDirectory: "templates/011-carrington", repository: "Lexington-Themes/carrington", vercelProjectName: "grids-demo-011", customDomain: "demo-011.gridsagency.com" },
  { id: "012", deploymentRepository: "taeminers/grids-template-library", theme: "coleman", libraryDirectory: "templates/012-coleman", repository: "Lexington-Themes/coleman", vercelProjectName: "grids-demo-012", customDomain: "demo-012.gridsagency.com" },
  { id: "013", deploymentRepository: "taeminers/grids-template-library", theme: "copperlane", libraryDirectory: "templates/013-copperlane", repository: "Lexington-Themes/copperlane", vercelProjectName: "grids-demo-013", customDomain: "demo-013.gridsagency.com" },
  { id: "014", deploymentRepository: "taeminers/grids-template-library", theme: "duckbutt", libraryDirectory: "templates/014-duckbutt", repository: "Lexington-Themes/duckbutt", vercelProjectName: "grids-demo-014", customDomain: "demo-014.gridsagency.com" },
  { id: "015", deploymentRepository: "taeminers/grids-template-library", theme: "dusk", libraryDirectory: "templates/015-dusk", repository: "Lexington-Themes/dusk", vercelProjectName: "grids-demo-015", customDomain: "demo-015.gridsagency.com" },
  { id: "016", deploymentRepository: "taeminers/grids-template-library", theme: "ellamae", libraryDirectory: "templates/016-ellamae", repository: "Lexington-Themes/ellamae", vercelProjectName: "grids-demo-016", customDomain: "demo-016.gridsagency.com" },
  { id: "017", deploymentRepository: "taeminers/grids-template-library", theme: "enlightr", libraryDirectory: "templates/017-enlightr", repository: "Lexington-Themes/enlightr", vercelProjectName: "grids-demo-017", customDomain: "demo-017.gridsagency.com" },
  { id: "018", deploymentRepository: "taeminers/grids-template-library", theme: "flabbergasted", libraryDirectory: "templates/018-flabbergasted", repository: "Lexington-Themes/flabbergasted", vercelProjectName: "grids-demo-018", customDomain: "demo-018.gridsagency.com" },
  { id: "019", deploymentRepository: "taeminers/grids-template-library", theme: "flaco", libraryDirectory: "templates/019-flaco", repository: "Lexington-Themes/flaco", vercelProjectName: "grids-demo-019", customDomain: "demo-019.gridsagency.com" },
  { id: "020", deploymentRepository: "taeminers/grids-template-library", theme: "gerstner", libraryDirectory: "templates/020-gerstner", repository: "Lexington-Themes/gerstner", vercelProjectName: "grids-demo-020", customDomain: "demo-020.gridsagency.com" },
  { id: "021", deploymentRepository: "taeminers/grids-template-library", theme: "hemingway", libraryDirectory: "templates/021-hemingway", repository: "Lexington-Themes/hemingway", vercelProjectName: "grids-demo-021", customDomain: "demo-021.gridsagency.com" },
  { id: "022", deploymentRepository: "taeminers/grids-template-library", theme: "hirewise", libraryDirectory: "templates/022-hirewise", repository: "Lexington-Themes/hirewise", vercelProjectName: "grids-demo-022", customDomain: "demo-022.gridsagency.com" },
  { id: "023", deploymentRepository: "taeminers/grids-template-library", theme: "jacobsen", libraryDirectory: "templates/023-jacobsen", repository: "Lexington-Themes/jacobsen", vercelProjectName: "grids-demo-023", customDomain: "demo-023.gridsagency.com" },
  { id: "024", deploymentRepository: "taeminers/grids-template-library", theme: "kotei", libraryDirectory: "templates/024-kotei", repository: "Lexington-Themes/kotei", vercelProjectName: "grids-demo-024", customDomain: "demo-024.gridsagency.com" },
  { id: "025", deploymentRepository: "taeminers/grids-template-library", theme: "matterhaus", libraryDirectory: "templates/025-matterhaus", repository: "Lexington-Themes/matterhaus", vercelProjectName: "grids-demo-025", customDomain: "demo-025.gridsagency.com" },
  { id: "026", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "molle", libraryDirectory: "templates/026-molle", repository: "Lexington-Themes/molle", vercelProjectName: "grids-demo-026", customDomain: "demo-026.gridsagency.com" },
  { id: "027", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "mulberry", libraryDirectory: "templates/027-mulberry", repository: "Lexington-Themes/mulberry", vercelProjectName: "grids-demo-027", customDomain: "demo-027.gridsagency.com" },
  { id: "028", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "navy", libraryDirectory: "templates/028-navy", repository: "Lexington-Themes/navy", vercelProjectName: "grids-demo-028", customDomain: "demo-028.gridsagency.com" },
  { id: "029", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "newport", libraryDirectory: "templates/029-newport", repository: "Lexington-Themes/newport", vercelProjectName: "grids-demo-029", customDomain: "demo-029.gridsagency.com" },
  { id: "030", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "northbound", libraryDirectory: "templates/030-northbound", repository: "Lexington-Themes/northbound", vercelProjectName: "grids-demo-030", customDomain: "demo-030.gridsagency.com" },
  { id: "031", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "ottis", libraryDirectory: "templates/031-ottis", repository: "Lexington-Themes/ottis", vercelProjectName: "grids-demo-031", customDomain: "demo-031.gridsagency.com" },
  { id: "032", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "outkast", libraryDirectory: "templates/032-outkast", repository: "Lexington-Themes/outkast", vercelProjectName: "grids-demo-032", customDomain: "demo-032.gridsagency.com" },
  { id: "033", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "phanatik", libraryDirectory: "templates/033-phanatik", repository: "Lexington-Themes/phanatik", vercelProjectName: "grids-demo-033", customDomain: "demo-033.gridsagency.com" },
  { id: "034", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "primapersona", libraryDirectory: "templates/034-primapersona", repository: "Lexington-Themes/primapersona", vercelProjectName: "grids-demo-034", customDomain: "demo-034.gridsagency.com" },
  { id: "035", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "profoliox", libraryDirectory: "templates/035-profoliox", repository: "Lexington-Themes/profoliox", vercelProjectName: "grids-demo-035", customDomain: "demo-035.gridsagency.com" },
  { id: "036", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "quartiere", libraryDirectory: "templates/036-quartiere", repository: "Lexington-Themes/quartiere", vercelProjectName: "grids-demo-036", customDomain: "demo-036.gridsagency.com" },
  { id: "037", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "riflesso", libraryDirectory: "templates/037-riflesso", repository: "Lexington-Themes/riflesso", vercelProjectName: "grids-demo-037", customDomain: "demo-037.gridsagency.com" },
  { id: "038", deploymentRepository: "taeminers/grids-template-deploy-2", theme: "rosewood", libraryDirectory: "templates/038-rosewood", repository: "Lexington-Themes/rosewood", vercelProjectName: "grids-demo-038", customDomain: "demo-038.gridsagency.com" },
  { id: "039", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "sandstone", libraryDirectory: "templates/039-sandstone", repository: "Lexington-Themes/sandstone", vercelProjectName: "grids-demo-039", customDomain: "demo-039.gridsagency.com" },
  { id: "040", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "scarlet", libraryDirectory: "templates/040-scarlet", repository: "Lexington-Themes/scarlet", vercelProjectName: "grids-demo-040", customDomain: "demo-040.gridsagency.com" },
  { id: "041", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "semplice", libraryDirectory: "templates/041-semplice", repository: "Lexington-Themes/semplice", vercelProjectName: "grids-demo-041", customDomain: "demo-041.gridsagency.com" },
  { id: "042", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "simplexity", libraryDirectory: "templates/042-simplexity", repository: "Lexington-Themes/simplexity", vercelProjectName: "grids-demo-042", customDomain: "demo-042.gridsagency.com" },
  { id: "043", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "snowpeak", libraryDirectory: "templates/043-snowpeak", repository: "Lexington-Themes/snowpeak", vercelProjectName: "grids-demo-043", customDomain: "demo-043.gridsagency.com" },
  { id: "044", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "spaziobianco", libraryDirectory: "templates/044-spaziobianco", repository: "Lexington-Themes/spaziobianco", vercelProjectName: "grids-demo-044", customDomain: "demo-044.gridsagency.com" },
  { id: "045", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "streamer", libraryDirectory: "templates/045-streamer", repository: "Lexington-Themes/streamer", vercelProjectName: "grids-demo-045", customDomain: "demo-045.gridsagency.com" },
  { id: "046", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "studiomax", libraryDirectory: "templates/046-studiomax", repository: "Lexington-Themes/studiomax", vercelProjectName: "grids-demo-046", customDomain: "demo-046.gridsagency.com" },
  { id: "047", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "trendspotter", libraryDirectory: "templates/047-trendspotter", repository: "Lexington-Themes/trendspotter", vercelProjectName: "grids-demo-047", customDomain: "demo-047.gridsagency.com" },
  { id: "048", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "vanta", libraryDirectory: "templates/048-vanta", repository: "Lexington-Themes/vanta", vercelProjectName: "grids-demo-048", customDomain: "demo-048.gridsagency.com" },
  { id: "049", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "westend", libraryDirectory: "templates/049-westend", repository: "Lexington-Themes/westend", vercelProjectName: "grids-demo-049", customDomain: "demo-049.gridsagency.com" },
  { id: "050", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "williamsburg", libraryDirectory: "templates/050-williamsburg", repository: "Lexington-Themes/williamsburg", vercelProjectName: "grids-demo-050", customDomain: "demo-050.gridsagency.com" },
  { id: "051", deploymentRepository: "taeminers/grids-template-deploy-3", theme: "zeroindex", libraryDirectory: "templates/051-zeroindex", repository: "Lexington-Themes/zeroindex", vercelProjectName: "grids-demo-051", customDomain: "demo-051.gridsagency.com" },
];

export function loadManifest(): readonly Template[] {
  const ids = new Set<string>();
  const repositories = new Set<string>();
  const projects = new Set<string>();
  const domains = new Set<string>();
  for (const entry of templateManifest) {
    if (!/^\d{3}$/.test(entry.id) || entry.id === "000" || !/^[a-z0-9][a-z0-9-]*$/.test(entry.theme) ||
        entry.repository !== `Lexington-Themes/${entry.theme}` ||
        entry.deploymentRepository !== (Number(entry.id) <= 25 ? templateLibraryRepository : Number(entry.id) <= 38 ? "taeminers/grids-template-deploy-2" : "taeminers/grids-template-deploy-3") ||
        entry.libraryDirectory !== `templates/${entry.id}-${entry.theme}` ||
        entry.vercelProjectName !== `grids-demo-${entry.id}` ||
        entry.customDomain !== `demo-${entry.id}.gridsagency.com` ||
        ids.has(entry.id) || repositories.has(entry.repository.toLowerCase()) ||
        projects.has(entry.vercelProjectName) || domains.has(entry.customDomain)) {
      throw new Error("Invalid or duplicate permanent template mapping. Nothing will be deployed.");
    }
    ids.add(entry.id);
    repositories.add(entry.repository.toLowerCase());
    projects.add(entry.vercelProjectName);
    domains.add(entry.customDomain);
  }
  if (templateManifest.length !== 51 || Array.from({ length: 51 }, (_, i) => String(i + 1).padStart(3, "0")).some(id => !ids.has(id))) {
    throw new Error("Permanent manifest must contain exactly IDs 001 through 051.");
  }
  if (!templateManifest.find((entry) => entry.id === "001")?.existingDeployment) {
    throw new Error("Existing template 001 must remain protected in the manifest.");
  }
  return [...templateManifest].sort((a, b) => a.id.localeCompare(b.id, "en"));
}

export function resolveTemplate(id: string): Template {
  const entry = loadManifest().find((template) => template.id === id);
  if (!entry) throw new Error(`ID ${id} is not in the permanent template manifest. Nothing was cloned or deployed.`);
  return entry;
}
