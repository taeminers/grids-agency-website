import HomeExperience from "@/components/home-experience";
import HomeBlogSection from "@/components/blog/home-blog-section";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <HomeExperience blogSection={<HomeBlogSection locale={locale} />} />;
}
