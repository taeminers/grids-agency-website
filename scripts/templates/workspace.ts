import { lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, Stats } from "node:fs";
import { basename, dirname, join } from "node:path";

export interface Workspace {
  directory: string;
  cleanup(): void;
}

export function createWorkspace(root: string, id: string): Workspace {
  if (!/^\d{3}$/.test(id) || id === "000") throw new Error("Invalid temporary workspace ID.");
  const parents = [join(realpathSync(root), ".tmp"), join(realpathSync(root), ".tmp/templates")];
  const identities: Stats[] = [];
  for (const parent of parents) {
    try { mkdirSync(parent); } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
    }
    const stat = lstatSync(parent);
    if (stat.isSymbolicLink() || !stat.isDirectory() || realpathSync(parent) !== parent) {
      throw new Error("Temporary workspace must be an ordinary directory inside this checkout.");
    }
    identities.push(stat);
  }
  const directory = mkdtempSync(join(parents[1], `${id}-`));
  const identity = lstatSync(directory);
  let removed = false;
  return {
    directory,
    cleanup() {
      if (removed) return;
      // Recheck parent and run directory identities. Never traverse a replaced
      // parent/symlink or remove another run, a legacy ID directory, or the root.
      if (dirname(directory) !== parents[1] || !basename(directory).startsWith(`${id}-`)) {
        throw new Error("Cleanup refused an unexpected directory.");
      }
      for (let index = 0; index < parents.length; index += 1) {
        const stat = lstatSync(parents[index]);
        if (stat.isSymbolicLink() || !stat.isDirectory() || realpathSync(parents[index]) !== parents[index] ||
            stat.dev !== identities[index].dev || stat.ino !== identities[index].ino) {
          throw new Error("Cleanup refused a changed temporary workspace parent.");
        }
      }
      let stat: Stats;
      try { stat = lstatSync(directory); } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") { removed = true; return; }
        throw error;
      }
      if (stat.isSymbolicLink() || !stat.isDirectory() || stat.dev !== identity.dev || stat.ino !== identity.ino) {
        throw new Error("Cleanup refused a replaced temporary run directory.");
      }
      // rmSync removes child symlinks themselves, without following their targets.
      rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
      removed = true;
    },
  };
}
