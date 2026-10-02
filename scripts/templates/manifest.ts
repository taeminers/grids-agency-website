// Permanent mapping captured from authenticated GitHub discovery.
// Never regenerate IDs from GitHub sort order; new entries require manual review.
export interface Template {
  readonly id: string;
  readonly theme: string;
  readonly repository: string;
  readonly vercelProjectName: string;
  readonly customDomain: string;
  readonly existingDeployment?: boolean;
}

export const templateManifest: readonly Template[] = [
  { id: "001", theme: "aelen", repository: "Lexington-Themes/aelen", vercelProjectName: "grids-demo-001", customDomain: "demo-001.gridsagency.com", existingDeployment: true },
  { id: "002", theme: "alfred", repository: "Lexington-Themes/alfred", vercelProjectName: "grids-demo-002", customDomain: "demo-002.gridsagency.com" },
  { id: "003", theme: "astromaxsp", repository: "Lexington-Themes/astromaxsp", vercelProjectName: "grids-demo-003", customDomain: "demo-003.gridsagency.com" },
  { id: "004", theme: "aubergine", repository: "Lexington-Themes/aubergine", vercelProjectName: "grids-demo-004", customDomain: "demo-004.gridsagency.com" },
  { id: "005", theme: "author", repository: "Lexington-Themes/author", vercelProjectName: "grids-demo-005", customDomain: "demo-005.gridsagency.com" },
  { id: "006", theme: "bastion", repository: "Lexington-Themes/bastion", vercelProjectName: "grids-demo-006", customDomain: "demo-006.gridsagency.com" },
  { id: "007", theme: "brightlight", repository: "Lexington-Themes/brightlight", vercelProjectName: "grids-demo-007", customDomain: "demo-007.gridsagency.com" },
  { id: "008", theme: "buio", repository: "Lexington-Themes/buio", vercelProjectName: "grids-demo-008", customDomain: "demo-008.gridsagency.com" },
  { id: "009", theme: "carbon", repository: "Lexington-Themes/carbon", vercelProjectName: "grids-demo-009", customDomain: "demo-009.gridsagency.com" },
  { id: "010", theme: "carriera", repository: "Lexington-Themes/carriera", vercelProjectName: "grids-demo-010", customDomain: "demo-010.gridsagency.com" },
  { id: "011", theme: "carrington", repository: "Lexington-Themes/carrington", vercelProjectName: "grids-demo-011", customDomain: "demo-011.gridsagency.com" },
  { id: "012", theme: "coleman", repository: "Lexington-Themes/coleman", vercelProjectName: "grids-demo-012", customDomain: "demo-012.gridsagency.com" },
  { id: "013", theme: "copperlane", repository: "Lexington-Themes/copperlane", vercelProjectName: "grids-demo-013", customDomain: "demo-013.gridsagency.com" },
  { id: "014", theme: "duckbutt", repository: "Lexington-Themes/duckbutt", vercelProjectName: "grids-demo-014", customDomain: "demo-014.gridsagency.com" },
  { id: "015", theme: "dusk", repository: "Lexington-Themes/dusk", vercelProjectName: "grids-demo-015", customDomain: "demo-015.gridsagency.com" },
  { id: "016", theme: "ellamae", repository: "Lexington-Themes/ellamae", vercelProjectName: "grids-demo-016", customDomain: "demo-016.gridsagency.com" },
  { id: "017", theme: "enlightr", repository: "Lexington-Themes/enlightr", vercelProjectName: "grids-demo-017", customDomain: "demo-017.gridsagency.com" },
  { id: "018", theme: "flabbergasted", repository: "Lexington-Themes/flabbergasted", vercelProjectName: "grids-demo-018", customDomain: "demo-018.gridsagency.com" },
  { id: "019", theme: "flaco", repository: "Lexington-Themes/flaco", vercelProjectName: "grids-demo-019", customDomain: "demo-019.gridsagency.com" },
  { id: "020", theme: "gerstner", repository: "Lexington-Themes/gerstner", vercelProjectName: "grids-demo-020", customDomain: "demo-020.gridsagency.com" },
  { id: "021", theme: "hemingway", repository: "Lexington-Themes/hemingway", vercelProjectName: "grids-demo-021", customDomain: "demo-021.gridsagency.com" },
  { id: "022", theme: "hirewise", repository: "Lexington-Themes/hirewise", vercelProjectName: "grids-demo-022", customDomain: "demo-022.gridsagency.com" },
  { id: "023", theme: "jacobsen", repository: "Lexington-Themes/jacobsen", vercelProjectName: "grids-demo-023", customDomain: "demo-023.gridsagency.com" },
  { id: "024", theme: "kotei", repository: "Lexington-Themes/kotei", vercelProjectName: "grids-demo-024", customDomain: "demo-024.gridsagency.com" },
  { id: "025", theme: "matterhaus", repository: "Lexington-Themes/matterhaus", vercelProjectName: "grids-demo-025", customDomain: "demo-025.gridsagency.com" },
  { id: "026", theme: "molle", repository: "Lexington-Themes/molle", vercelProjectName: "grids-demo-026", customDomain: "demo-026.gridsagency.com" },
  { id: "027", theme: "mulberry", repository: "Lexington-Themes/mulberry", vercelProjectName: "grids-demo-027", customDomain: "demo-027.gridsagency.com" },
  { id: "028", theme: "navy", repository: "Lexington-Themes/navy", vercelProjectName: "grids-demo-028", customDomain: "demo-028.gridsagency.com" },
  { id: "029", theme: "newport", repository: "Lexington-Themes/newport", vercelProjectName: "grids-demo-029", customDomain: "demo-029.gridsagency.com" },
  { id: "030", theme: "northbound", repository: "Lexington-Themes/northbound", vercelProjectName: "grids-demo-030", customDomain: "demo-030.gridsagency.com" },
  { id: "031", theme: "ottis", repository: "Lexington-Themes/ottis", vercelProjectName: "grids-demo-031", customDomain: "demo-031.gridsagency.com" },
  { id: "032", theme: "outkast", repository: "Lexington-Themes/outkast", vercelProjectName: "grids-demo-032", customDomain: "demo-032.gridsagency.com" },
  { id: "033", theme: "phanatik", repository: "Lexington-Themes/phanatik", vercelProjectName: "grids-demo-033", customDomain: "demo-033.gridsagency.com" },
  { id: "034", theme: "primapersona", repository: "Lexington-Themes/primapersona", vercelProjectName: "grids-demo-034", customDomain: "demo-034.gridsagency.com" },
  { id: "035", theme: "profoliox", repository: "Lexington-Themes/profoliox", vercelProjectName: "grids-demo-035", customDomain: "demo-035.gridsagency.com" },
  { id: "036", theme: "quartiere", repository: "Lexington-Themes/quartiere", vercelProjectName: "grids-demo-036", customDomain: "demo-036.gridsagency.com" },
  { id: "037", theme: "riflesso", repository: "Lexington-Themes/riflesso", vercelProjectName: "grids-demo-037", customDomain: "demo-037.gridsagency.com" },
  { id: "038", theme: "rosewood", repository: "Lexington-Themes/rosewood", vercelProjectName: "grids-demo-038", customDomain: "demo-038.gridsagency.com" },
  { id: "039", theme: "sandstone", repository: "Lexington-Themes/sandstone", vercelProjectName: "grids-demo-039", customDomain: "demo-039.gridsagency.com" },
  { id: "040", theme: "scarlet", repository: "Lexington-Themes/scarlet", vercelProjectName: "grids-demo-040", customDomain: "demo-040.gridsagency.com" },
  { id: "041", theme: "semplice", repository: "Lexington-Themes/semplice", vercelProjectName: "grids-demo-041", customDomain: "demo-041.gridsagency.com" },
  { id: "042", theme: "simplexity", repository: "Lexington-Themes/simplexity", vercelProjectName: "grids-demo-042", customDomain: "demo-042.gridsagency.com" },
  { id: "043", theme: "snowpeak", repository: "Lexington-Themes/snowpeak", vercelProjectName: "grids-demo-043", customDomain: "demo-043.gridsagency.com" },
  { id: "044", theme: "spaziobianco", repository: "Lexington-Themes/spaziobianco", vercelProjectName: "grids-demo-044", customDomain: "demo-044.gridsagency.com" },
  { id: "045", theme: "streamer", repository: "Lexington-Themes/streamer", vercelProjectName: "grids-demo-045", customDomain: "demo-045.gridsagency.com" },
  { id: "046", theme: "studiomax", repository: "Lexington-Themes/studiomax", vercelProjectName: "grids-demo-046", customDomain: "demo-046.gridsagency.com" },
  { id: "047", theme: "trendspotter", repository: "Lexington-Themes/trendspotter", vercelProjectName: "grids-demo-047", customDomain: "demo-047.gridsagency.com" },
  { id: "048", theme: "vanta", repository: "Lexington-Themes/vanta", vercelProjectName: "grids-demo-048", customDomain: "demo-048.gridsagency.com" },
  { id: "049", theme: "westend", repository: "Lexington-Themes/westend", vercelProjectName: "grids-demo-049", customDomain: "demo-049.gridsagency.com" },
  { id: "050", theme: "williamsburg", repository: "Lexington-Themes/williamsburg", vercelProjectName: "grids-demo-050", customDomain: "demo-050.gridsagency.com" },
  { id: "051", theme: "zeroindex", repository: "Lexington-Themes/zeroindex", vercelProjectName: "grids-demo-051", customDomain: "demo-051.gridsagency.com" },
];

export function loadManifest(): readonly Template[] {
  const ids = new Set<string>();
  const repositories = new Set<string>();
  const projects = new Set<string>();
  const domains = new Set<string>();
  for (const entry of templateManifest) {
    if (!/^\d{3}$/.test(entry.id) || entry.id === "000" || !/^[a-z0-9][a-z0-9-]*$/.test(entry.theme) ||
        entry.repository !== `Lexington-Themes/${entry.theme}` ||
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
