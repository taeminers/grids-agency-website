import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/container";
import { getPrivacyCopy, type PrivacyBlock } from "@/content/privacy-policy";
import { privacyPublication, privacyPublished } from "@/lib/privacy-publication";
import styles from "./privacy.module.css";

function PolicyText({ text }: { text: string }) {
  return text.split(/(https:\/\/[A-Za-z0-9./-]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|010-6333-1509)/g).map((part, index) => {
    const href = part.startsWith("https://") ? part : part.includes("@") ? `mailto:${part}` : part === "010-6333-1509" ? "tel:+821063331509" : null;
    return href ? <a key={index} href={href}>{part}</a> : part;
  });
}

function PolicyContent({ block }: { block: PrivacyBlock }) {
  switch (block.type) {
    case "paragraph": return <p><PolicyText text={block.text} /></p>;
    case "heading": return <h3>{block.text}</h3>;
    case "list": return <ul>{block.items.map((item, index) => <li key={index}><PolicyText text={item} /></li>)}</ul>;
    case "table": return <div className={styles.tableWrapper}><table>
      <thead><tr>{block.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
      <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0
        ? <th key={cellIndex} scope="row">{cell}</th>
        : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
    </table></div>;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = getPrivacyCopy(locale);
  return { title: `${copy.title} — GRIDS AGENCY`, robots: privacyPublished ? undefined : { index: false, follow: false } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!privacyPublished && process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  const copy = getPrivacyCopy(locale);
  return <main className={styles.page}>
    <Container size="reading">
      <header className={styles.header}>
        <h1>{copy.title}</h1>
        <dl className={styles.metadata}>
          <div><dt>{copy.effective}</dt><dd>{privacyPublication.effectiveDate ?? copy.pendingDate}</dd></div>
          <div><dt>{copy.version}</dt><dd>{privacyPublication.version}</dd></div>
          <div><dt>{copy.contact}</dt><dd><a href={`mailto:${privacyPublication.contactEmail}`}>{privacyPublication.contactEmail}</a></dd></div>
        </dl>
        <div className={styles.introduction}>
          <p>{copy.introduction}</p>
          <p><PolicyText text={copy.scope} /></p>
        </div>
      </header>
      {!privacyPublished && <aside className={styles.draft} aria-label={copy.draftLabel}><strong>{copy.draftLabel}</strong><p>{copy.draftDescription}</p></aside>}
      <div className={styles.contents}>
        <p className={styles.contentsTitle}>{locale === "ko" ? "목차" : "Contents"}</p>
        <nav aria-label={locale === "ko" ? "처리방침 목차" : "Policy contents"}>
          {copy.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
        </nav>
      </div>
      <div className={styles.sections}>
        {copy.sections.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`}>{section.title}</h2>
          {section.blocks.map((block, index) => <PolicyContent key={index} block={block} />)}
        </section>)}
        <p className={styles.effectiveStatement}>{copy.effectiveStatement}</p>
      </div>
    </Container>
  </main>;
}
