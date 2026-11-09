import type { ReactNode } from "react";
import { ArchiveNavigation } from "@/components/archive/archive-navigation";

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <ArchiveNavigation>{children}</ArchiveNavigation>;
}
