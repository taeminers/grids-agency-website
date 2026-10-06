import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArchiveWrapper } from "@/components/archive/archive-wrapper";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Archive.Index" });
    return {
        title: `${t("title")} — GRIDS`,
        description: t("description"),
    };
}

export default function ArchivePage() {
    return (
        <main className="min-h-screen bg-background">
            <ArchiveWrapper />
        </main>
    );
}
