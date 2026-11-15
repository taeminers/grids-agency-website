import "server-only";

import Image from "next/image";
import { ArrowUp, ChevronLeft, ChevronRight, Instagram, Menu } from "lucide-react";
import WebsiteComparison from "./website-comparison";
import InteriorContactMenu from "./interior-contact-menu";
import styles from "./website-comparison.module.css";

function PoorInteriorWebsite() {
  return (
    <div
      className={`${styles.siteViewport} ${styles.poorViewport}`}
      role="img"
      aria-label="작은 메뉴와 흔한 홍보 문구, 중앙 정렬한 제목과 오른쪽 소셜 바로가기 버튼이 있는 가상의 온담 인테리어 홈페이지 히어로."
    >
      <div className={styles.poorSite} aria-hidden="true">
        <div className={styles.poorNav}>
          <b>
            온담<span>인테리어</span>
          </b>
          <div>
            {[
              "전체보기",
              "회사소개",
              "시공분야",
              "시공후기",
              "시공사례",
              "이벤트",
              "온라인상담",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className={styles.poorHero}>
          <Image
            src="/images/blog/interior/office-meeting.webp"
            alt=""
            fill
            sizes="(max-width: 639px) 90vw, 720px"
          />
          <div className={styles.poorHeroShade} />
          <div className={styles.poorHeroCopy}>
            <span>ONDAM INTERIOR DESIGN</span>
            <h3>
              고객의 꿈을 디자인하는
              <br />
              온담 인테리어
            </h3>
            <p>
              최고의 기술과 정성으로 고객 만족을 실현합니다.
              <br />
              주거 · 상업 · 사무 공간, 인테리어의 모든 것
            </p>
            <div className={styles.poorHeroActions}>
              <span>회사소개</span>
              <span>온라인 상담</span>
            </div>
          </div>
          <span className={`${styles.poorSlideArrow} ${styles.poorSlidePrev}`}>
            <ChevronLeft size={22} strokeWidth={1} />
          </span>
          <span className={`${styles.poorSlideArrow} ${styles.poorSlideNext}`}>
            <ChevronRight size={22} strokeWidth={1} />
          </span>
          <div className={styles.poorSlideDots}>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.poorSocialRail}>
            <span className={styles.poorSocialButton}><Image src="/icons/integrations/naver.svg" alt="" width={17} height={17} /></span>
            <span className={styles.poorSocialButton}><Image src="/icons/integrations/kakao.svg" alt="" width={21} height={21} /></span>
            <span className={styles.poorSocialButton}><span className={styles.poorBlogMark}>blog</span></span>
            <span className={styles.poorSocialButton}><span className={styles.poorInstagramMark}><Instagram size={17} strokeWidth={2} /></span></span>
            <span className={`${styles.poorSocialButton} ${styles.poorBackToTop}`}><ArrowUp size={20} strokeWidth={1.5} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImprovedInteriorWebsite() {
  return (
    <div
      className={`${styles.siteViewport} ${styles.goodViewport}`}
    >
      <div className={styles.goodSite} role="img"
        aria-label="왼쪽 제목과 오른쪽 안내 및 시공 사례 버튼, 아래로 넓게 펼쳐지는 오피스 사진으로 구성한 온담 인테리어 홈페이지 히어로.">
        <div className={styles.goodNav}>
          <div className={styles.goodLinks}>
            <span>시공 사례</span>
            <span>서비스 안내</span>
            <span>회사 소개</span>
          </div>
          <div className={styles.goodLogo}>
            ondam<span>®</span>
          </div>
          <span className={styles.goodNavCta}>
            <span className={styles.goodNavCtaFull}>견적 받기</span>
            <span className={styles.goodNavCtaShort}>견적 받기</span>
          </span>
          <Menu className={styles.goodMenu} size={18} />
        </div>
        <div className={styles.goodHero}>
          <div className={styles.goodIntro}>
            <div className={styles.goodCopy}>
              <h3>
                더 나은 업무 공간을,
                <br />
                온담과 함께 만드세요.
              </h3>
            </div>
            <div className={styles.goodDetails}>
              <p>
                공간 기획부터 설계와 시공까지.
                <br />
                팀의 일하는 방식에 꼭 맞는 오피스를 만듭니다.
              </p>
              <div className={styles.goodActions}>
                <span className={styles.goodCta}>시공 사례 보기</span>
              </div>
            </div>
          </div>
          <div className={styles.goodPhoto}>
            <Image
              src="/images/blog/interior/office-meeting.webp"
              alt=""
              fill
              sizes="(max-width: 639px) 90vw, 720px"
            />
            <span className={styles.goodPhotoIndex}>오피스 인테리어 전문</span>
            <div className={styles.goodPhotoCaption}>
              <b>
                10년의 경험으로,
                <br />
                오피스의 새로운 기준을 만듭니다.
              </b>
              <p>설계부터 시공까지, 오피스에 집중합니다.</p>
            </div>
          </div>
        </div>
      </div>
      <InteriorContactMenu />
    </div>
  );
}

export default function InteriorWebsiteExamples() {
  return (
    <WebsiteComparison
      poor={<PoorInteriorWebsite />}
      improved={<ImprovedInteriorWebsite />}
    />
  );
}
