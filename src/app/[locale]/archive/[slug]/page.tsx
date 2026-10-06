import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { archiveProjects } from "@/components/archive/archive-project-data";
import { ArchiveGrid } from "@/components/archive/archive-grid";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = archiveProjects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  const t = await getTranslations({ locale, namespace: `Archive.${project.namespace}` });
  return { title: `${project.title ?? t("projectTitle")} — GRIDS Archive`, description: t("description") };
}

export default async function ArchiveDetailPage({ params }: Props) {
  const { slug } = await params;
  const index = archiveProjects.findIndex((entry) => entry.slug === slug);
  if (index === -1) notFound();

  return (
    <main className="min-h-screen bg-background">
      <ArchiveGrid initialProjectSlug={slug} />
    </main>
  );
}
