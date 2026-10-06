"use client";

import { ArchiveProjectPanel } from "./archive-project-panel";
import { archiveProjects } from "./archive-project-data";

export function ArchiveWebsites({ active }: { active: boolean }) {
  return <ArchiveProjectPanel active={active} project={archiveProjects[0]} />;
}
