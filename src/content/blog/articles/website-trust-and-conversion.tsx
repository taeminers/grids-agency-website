import { BlogReading, BlogVisual } from "@/components/blog/article-blocks";
import ArticleTimeline from "@/components/blog/article-timeline";
import InteriorWebsiteExamples from "@/components/blog/illustrations/interior-website-examples";
import ConsultationLink from "@/components/consultation-link";
import styles from "./website-trust-and-conversion.module.css";

const sections = [
  { id: "customer-perspective", label: "고객은 생각보다 쉽게 떠납니다." },
  { id: "website-trust", label: "실제로 얼마나 많은 고객이 떠날까요?" },
  { id: "advertising-costs", label: "고객이 떠날 때, 기회도 사라집니다." },
  { id: "invisible-exits", label: "조용히 떠나는 고객" },
  { id: "design-and-measurement", label: "떠나지 않게 만드는 홈페이지" },
  { id: "references-heading", label: "참고 자료" },
];

export default function WebsiteTrustAndConversion() {
  return <>
    <ArticleTimeline sections={sections} />

    <BlogReading>
      <p>광고도 하고, 검색하면 홈페이지도 나옵니다. 방문자도 꾸준히 들어오는데, 이상하게 문의는 늘지 않습니다.</p>
      <p>
        문제가 무엇일까요? 고객이 우리 업체에 관심이 없는 걸까요? 아니면 {" "}
        <strong>관심을 갖고 찾아온 고객을 홈페이지에서 놓치고 있는 걸까요?</strong>
      </p>

      <h2 id="customer-perspective">고객은 생각보다 쉽게 떠납니다.</h2>
      <p>
        사무실 인테리어 공사를 앞둔 고객이 있다고 가정해 보겠습니다.
        여러 업체를 검색하다가 마음에 드는 곳을 발견했습니다. 사진도 괜찮고, 후기도 나쁘지 않습니다. 더 알아보기 위해 홈페이지에 들어갑니다.
      </p>
      <p>
        그런데 페이지가 늦게 열립니다. 휴대폰에서는 글씨가 작고, 시공 사례는 몇 년 전 사진뿐입니다.
        어떤 분야를 전문으로 하는지, 다른 업체와 무엇이 다른지도 알기 어렵습니다.
        견적을 문의하려고 했지만, 연락 방법마저 찾기 번거롭습니다. 고객은 어떻게 할까요?
      </p>
      <p>
        <strong>굳이 불편함을 감수할 이유가 없습니다. 뒤로 가기를 누르고, 다른 업체를 찾아보면 그만입니다.</strong>{" "}
        실제로는 훌륭한 시공 실력과 합리적인 가격을 갖춘 업체일 수도 있습니다. 하지만 고객은 그 사실을 확인하기 전에 떠났습니다.
        이처럼 홈페이지에서의 작은 불편함이 어렵게 얻은 고객의 관심을 잃게 만드는 원인이 될 수 있습니다.
      </p>
    </BlogReading>

    <BlogVisual size="reading">
      <InteriorWebsiteExamples />
    </BlogVisual>

    <BlogReading>
      <h2 id="website-trust">실제로 얼마나 많은 고객이 떠날까요?</h2>
      <p>
        미국 기업 서비스 비교 플랫폼 Clutch가 2025년 소비자 263명을 대상으로 실시한 조사에서는 {" "}
        <strong>87%가 신뢰할 수 없다고 느낀 웹사이트를 즉시 떠난 경험이 있다</strong>고 응답했습니다.
        또한 다음과 같은 요소가 웹사이트에 대한 불신을 유발한다고 답했습니다.
      </p>
      <ul>
        <li><strong>49%</strong> — 복잡하고 이해하기 어려운 메뉴</li>
        <li><strong>46%</strong> — 작동하지 않는 버튼과 잘못된 링크</li>
        <li><strong>45%</strong> — 오래되고 불편한 디자인</li>
        <li><strong>44%</strong> — 느린 페이지 로딩</li>
        <li><strong>42%</strong> — 찾기 어려운 연락 방법</li>
      </ul>
      <p>
        미국 소비자를 대상으로 한 조사이므로 국내 고객에게 동일한 비율을 적용할 수는 없습니다.
        또한 위 수치는 실제 이탈률이 아닌 설문 응답입니다.
      </p>
      <p>
        하지만 중요한 점을 보여줍니다.{" "}
        <strong>고객은 서비스의 품질을 경험하기도 전에, 홈페이지에서 느낀 불편함과 불신 때문에 떠날 수 있다는 것입니다.</strong>
      </p>
    </BlogReading>

    <BlogReading>
      <h2 id="advertising-costs">고객이 떠날 때, 기회도 함께 사라집니다.</h2>
      <p>
        특히 광고를 집행하는 업체라면 이 문제를 더욱 주의 깊게 살펴볼 필요가 있습니다.
        광고를 클릭한 고객이 홈페이지를 방문했다면, 고객을 데려오는 데 이미 비용을 지불한 셈입니다.
        그런데 홈페이지가 느리거나, 필요한 정보를 찾기 어렵거나, 문의 과정이 복잡해 고객이 떠난다면 어떨까요?
      </p>
      <p>
        <strong>광고는 고객을 데려오는 데 성공했지만, 홈페이지가 그 기회를 놓친 것입니다.</strong>{" "}
        광고비를 늘려 방문자를 두 배로 확보하더라도, 같은 문제가 반복된다면 충분한 성과를 얻기 어렵습니다.
      </p>
      <p>
        물론 고객이 떠나는 이유가 모두 홈페이지에 있는 것은 아닙니다. 가격이나 경쟁업체, 고객의 구매 의사 등 다양한 요인이 영향을 미칩니다.
        그렇기 때문에 더욱 중요한 것이 있습니다.
      </p>
    </BlogReading>

    <BlogReading>
      <h2 id="invisible-exits">가장 큰 문제는 고객이 떠났다는 사실조차 모른다는 것입니다.</h2>
      <p>
        오프라인 매장에서는 고객이 물건을 살펴보다가 돌아가거나, 원하는 정보를 찾지 못해 직원에게 질문하는 모습을 볼 수 있습니다.
        하지만 온라인에서는 다릅니다. <strong>고객은 아무 말 없이 홈페이지를 닫습니다.</strong>
      </p>
      <p>
        무엇이 불편했는지, 어느 페이지에서 관심을 잃었는지, 왜 문의하지 않았는지 알려주지 않습니다.
        어제도, 오늘도 우리 업체에 관심을 가진 잠재 고객들이 이렇게 떠나고 있을지 모릅니다.
      </p>
      <p>
        그래서 홈페이지는 만들고 끝내는 것이 아니라, 실제 이용 현황을 살펴보고 지속적으로 개선하는 것이 중요합니다.
        어떤 경로로 고객이 찾아왔는지, 어떤 페이지를 살펴봤는지, 어디에서 이탈이 많이 발생하는지, 어떤 버튼을 클릭했는지, 실제 문의까지 얼마나 이어졌는지 확인해야 합니다.
        이러한 데이터가 고객의 생각을 모두 알려주지는 않지만, <strong>막연한 추측 대신 실제 데이터를 바탕으로 개선할 부분을 찾아가는 출발점</strong>이 됩니다.
      </p>
    </BlogReading>

    <BlogReading>
      <h2 id="design-and-measurement">고객을 데려오는 것만큼, 떠나지 않게 만드는 것도 중요합니다.</h2>
      <p>
        그리즈(GRIDS)는 경쟁업체 사이에서도 돋보이는 완성도 높은 디자인과 편리한 사용자 경험을 바탕으로 웹사이트를 설계하고 개발합니다.
        하지만 저희가 중요하게 생각하는 것은 홈페이지를 완성한 이후에도 있습니다.{" "}
        <strong>보기 좋은 웹사이트를 만드는 데서 끝나지 않고, 실제 고객이 어떻게 이용하는지 확인하고 개선할 수 있는 환경까지 만듭니다.</strong>
      </p>
      <p>
        분석 도구를 통해 방문 경로, 페이지별 이용 현황, 체류 및 참여 시간, 버튼 클릭, 문의 전환 등을 측정할 수 있도록 돕습니다.
        이를 바탕으로 고객이 불편을 겪을 가능성이 있는 지점을 찾고, 더 나은 경험을 만들기 위한 개선 방향을 제안할 수 있습니다.
      </p>
      <p>
        좋은 디자인으로 고객의 관심을 얻고, 편리한 경험으로 신뢰를 쌓고, 데이터로 지속적으로 개선하는 웹사이트.{" "}
        <strong>지금 귀사의 홈페이지는 고객을 맞이하고 있나요, 아니면 떠나보내고 있나요?</strong>
      </p>
      <div className={styles.contactAction}>
        <ConsultationLink href="/ko/connect" label="GRIDS에 문의하기" className={styles.contactLink} />
      </div>
    </BlogReading>

    <BlogReading>
      <footer className={styles.references} aria-labelledby="references-heading">
        <h2 id="references-heading">참고 자료</h2>
        <ul>
          <li><a href="https://clutch.co/resources/what-trustworthy-websites-look-like-2025">Clutch — What Trustworthy Websites Look Like in 2025</a> — 2025년 6월 미국 소비자 263명을 대상으로 진행한 웹사이트 신뢰도 및 이용 경험 설문조사.</li>
        </ul>
      </footer>
    </BlogReading>
  </>;
}
