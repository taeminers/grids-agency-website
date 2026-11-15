import "server-only";

import Container from "@/components/container";
import Link from "@/components/navigation/page-navigation";
import type { BlogPost } from "@/content/blog/posts";
import styles from "./article-wireframe.module.css";

function TextLines({ count = 4 }: { count?: number }) {
  return <div className={styles.lines} aria-hidden="true">
    {Array.from({ length: count }, (_, index) => <span key={index} />)}
  </div>;
}

export function BlogArticleWireframe({ post }: { post: BlogPost }) {
  return <main className={styles.page}>
    <article lang={post.locale} aria-labelledby="article-title">
      <Container>
        <div className={styles.previewBar}>
          <Link href={`/${post.locale}/blog`}>블로그</Link>
          <span>초안 · 레이아웃 미리보기</span>
        </div>
        <div className={styles.hero} role="img" aria-label="일러스트레이션 히어로가 들어갈 자리">
          <span>일러스트레이션 히어로</span>
        </div>
      </Container>

      <header className={styles.header}>
        <Container size="reading">
          <h1 id="article-title" className="sr-only">{post.title}</h1>
          <p className="sr-only">{post.summary}</p>
          <p className={styles.label}>제목 · 소개</p>
          <div className={styles.titleLines} aria-hidden="true"><span /><span /></div>
          <TextLines count={3} />
          <div className={styles.metadata}>
            <span className="sr-only">작성: {post.author.name}. 발행 전.</span>
            <div className={styles.author} aria-hidden="true"><span className={styles.avatar} /><span className={styles.authorLine} /></div>
            <span className={styles.dateLine} aria-hidden="true" />
          </div>
        </Container>
      </header>

      <div className={styles.body}>
        <Container size="reading">
          <section aria-label="도입부 자리">
            <p className={styles.label}>도입부</p>
            <TextLines count={5} />
          </section>
        </Container>

        <Container size="headline">
          <div className={styles.visual} role="img" aria-label="본문 이미지 또는 다이어그램이 들어갈 자리">
            <span>본문 이미지 · 다이어그램</span>
          </div>
        </Container>

        <Container size="reading" innerClassName={styles.readingSections}>
          <section aria-label="본문 섹션 자리">
            <p className={styles.label}>본문 섹션</p>
            <span className={styles.sectionHeading} aria-hidden="true" />
            <TextLines count={5} />
            <TextLines count={3} />
          </section>
          <aside className={styles.callout} aria-label="핵심 내용 요약 자리">
            <span>핵심 내용 · 요약</span>
          </aside>
          <section aria-label="마무리 자리">
            <p className={styles.label}>마무리</p>
            <span className={styles.sectionHeading} aria-hidden="true" />
            <TextLines count={4} />
          </section>
        </Container>
      </div>
    </article>
  </main>;
}
