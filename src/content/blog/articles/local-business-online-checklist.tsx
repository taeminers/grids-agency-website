import { BlogReading } from "@/components/blog/article-blocks";
import ConsultationLink from "@/components/consultation-link";
import ArticleTimeline from "@/components/blog/article-timeline";
import OnlineResearchBars from "@/components/blog/illustrations/online-research-bars";
import styles from "./local-business-online-checklist.module.css";

const checklist = [
  { id: "discovery", title: "고객이 우리를 발견할 수 있나요?", description: "업체명뿐 아니라 고객이 실제로 검색할 만한 서비스명이나 지역명으로도 찾아보세요." },
  { id: "information", title: "첫인상이 신뢰를 주나요?", description: "검색 결과, 사진, 소개 문구만 보고도 어떤 업체인지 명확히 알 수 있나요?" },
  { id: "difference", title: "선택할 이유가 있나요?", description: "경쟁업체와 비교했을 때 우리만의 강점과 차별점이 드러나나요?" },
  { id: "answers", title: "궁금증을 해결할 수 있나요?", description: "서비스 내용, 가격 안내, 작업 사례, 진행 과정 등을 쉽게 확인할 수 있나요?" },
  { id: "trust", title: "신뢰할 근거가 충분한가요?", description: "실제 활동과 경험, 후기, 전문성을 뒷받침하는 정보가 있나요?" },
  { id: "contact", title: "문의하기 쉬운가요?", description: "고객이 휴대폰에서 복잡한 절차 없이 상담하거나 예약할 수 있나요?" },
];

const sections = [
  { id: "customer-journey", label: "고객은 어떻게 우리 업체를 찾아올까요?" },
  { id: "customer-research", label: "실제로 고객들은 얼마나 검색하고 비교할까요?" },
  { id: "online-checklist", label: "지금, 고객의 눈으로 직접 확인해 보세요." },
  { id: "online-signboard", label: "오프라인에는 간판이 있는데, 온라인에는 있나요?" },
  { id: "references-heading", label: "참고 자료" },
];

export default function LocalBusinessOnlineChecklist() {
  return <>
    <ArticleTimeline sections={sections} />
    <BlogReading>
      <p>좋은 제품과 서비스를 제공하는데도 새로운 고객이 늘지 않으시나요? 그렇다면 잠시 사장님의 입장이 아닌, <strong>고객의 입장에서 생각해 보겠습니다.</strong></p>

      <h2 id="customer-journey">고객은 어떻게 우리 업체를 찾아올까요?</h2>
      <p>
        흉터 치료를 고민하는 고객이 있다고 가정해 보겠습니다. 이 고객은 먼저 유튜브에서 관련 영상을 찾아보거나, 인스타그램에서 정보를 접할 수도 있습니다.
        네이버나 구글에 &apos;흉터 치료 피부과&apos;를 검색하거나, 모두닥 같은 전문 플랫폼에서 병원을 비교할 수도 있겠죠.
        어떤 경로를 선택하든, 고객은 여러 업체를 발견하게 됩니다. <strong>운이 좋다면 그중 우리 업체도 눈에 띌 것입니다.</strong>
      </p>
      <p>
        하지만 여기서 끝이 아닙니다. 고객은 관심이 생긴 몇 곳을 더 자세히 살펴봅니다. 후기를 찾아보고, 어떤 서비스를 제공하는지 확인하고, 홈페이지가 있다면 방문해 봅니다.
        그런데 우리 업체의 정보를 찾기 어렵거나, 경쟁업체에 비해 전문성과 강점이 잘 드러나지 않는다면 어떨까요?
        고객은 별다른 고민 없이 다른 업체로 넘어갈 수 있습니다. <strong>우리 업체를 발견한 고객이 반드시 우리 고객이 되는 것은 아닙니다.</strong>
      </p>
      <p>이런 과정은 피부과에만 해당하지 않습니다. 인테리어 업체, 학원, 전문 서비스 기업 등 고객이 여러 선택지를 비교하는 업종에서도 마찬가지입니다.</p>

      <h2 id="customer-research">실제로 고객들은 얼마나 검색하고 비교할까요?</h2>
      <OnlineResearchBars />
      <p>
        과학기술정보통신부가 2026년 발표한 「2025년 부가통신사업 실태조사」에 따르면, 국내 성인 2,500명을 대상으로 한 조사에서 {" "}
        <strong>검색 서비스 이용률은 98.7%, 플레이스·지도 서비스 이용률은 96.8%</strong>였습니다.
        <sup className={styles.sourceRef}><a href="#source-msit" aria-label="참고 자료 1">[1]</a></sup>
      </p>
      <p>
        또한 BrightLocal의 2026년 미국 소비자 조사에서는 <strong>54%가 긍정적인 후기를 읽은 뒤 취할 행동으로 해당 업체의 웹사이트 확인을 선택</strong>했습니다.
        <sup className={styles.sourceRef}><a href="#source-brightlocal" aria-label="참고 자료 2">[2]</a></sup>{" "}
        두 조사는 대상과 문항이 서로 다르며, 모든 고객이 업체 방문 전 검색한다는 의미는 아닙니다.
      </p>
      <p>그럼에도 한 가지 중요한 점을 생각해 볼 수 있습니다. <strong>고객에게 발견되는 것만큼, 발견된 이후 신뢰를 얻는 것도 중요하다는 사실입니다.</strong></p>
    </BlogReading>

    <BlogReading className={styles.checklistSection}>
      <h2 id="online-checklist">지금, 고객의 눈으로 직접 확인해 보세요.</h2>
      <p>휴대폰을 꺼내 처음 우리 업체를 알게 된 고객이라고 생각하고 아래 항목을 확인해 보세요.</p>
      <section className={styles.checklistPanel} aria-label="우리 업체 온라인 점검 체크리스트">
        <ul className={styles.checklist} role="list">
          {checklist.map(item => <li key={item.id}>
            <label htmlFor={`online-check-${item.id}`}>
              <input type="checkbox" id={`online-check-${item.id}`} />
              <span><strong>{item.title}</strong><span className={styles.description}>{item.description}</span></span>
            </label>
          </li>)}
        </ul>
      </section>

      <p id="after-your-checklist"><strong>몇 가지나 체크하셨나요?</strong></p>
      <p>
        검색에서 잘 발견되지 않는다면 <a href="https://help.naver.com/service/30026/contents/20366?lang=ko">네이버 스마트플레이스</a>와 {" "}
        <a href="https://support.google.com/business/answer/2911778?hl=ko">구글 비즈니스 프로필</a>의 정보부터 정비해 보세요. 기본 등록과 관리는 무료로 시작할 수 있습니다.
      </p>
      <p>
        반면 고객이 우리 업체를 발견하더라도 선택할 이유를 충분히 전달하지 못하고 있다면, 단순히 광고비를 늘리거나 검색 노출을 높이는 것만으로는 부족할 수 있습니다.{" "}
        <strong>고객을 데려오는 것도 중요하지만, 찾아온 고객이 우리를 선택할 수 있게 만드는 것이 중요합니다.</strong>{" "}
        잘 설계된 웹사이트는 이 과정에서 중요한 역할을 할 수 있습니다. 우리 업체의 강점을 보여주고, 고객의 궁금증을 해결하며, 관심을 실제 문의로 연결하는 공간이기 때문입니다.
      </p>
    </BlogReading>

    <BlogReading>
      <h2 id="online-signboard">오프라인에는 간판이 있는데, 온라인에는 있나요?</h2>
      <p>
        사업을 시작하면 간판을 달고, 현수막을 걸고, 매장을 꾸미는 데 적지 않은 비용을 투자합니다.
        지나가는 사람들에게 우리 가게를 알리고, 좋은 첫인상을 남기기 위해서입니다. 그런데 오프라인 간판은 그 앞을 지나가는 사람들에게만 보입니다.
      </p>
      <p>
        <strong>온라인에서의 간판은 다릅니다.</strong> 웹사이트는 시간과 장소의 제약을 줄이고, 우리 업체를 찾는 더 많은 잠재 고객에게 다가갈 기회를 만들어줍니다.
        무엇보다 단순히 이름을 알리는 데 그치지 않습니다. 고객에게 우리를 선택할 이유를 설명하고, 신뢰를 쌓고, 실제 문의까지 연결할 수 있습니다.
      </p>
      <p id="start-online">
        <strong>우리 업체의 온라인 간판은 지금 어떤 모습인가요?</strong>{" "}
        그리즈(GRIDS)는 고객이 업체를 발견하고, 비교하고, 선택하는 과정을 고려해 웹사이트를 설계하고 개발합니다.
        보기 좋은 디자인을 넘어, 귀사의 비즈니스에 실질적으로 도움이 되는 디지털 환경을 만들어갑니다.
      </p>
      <div className={styles.contactAction}>
        <ConsultationLink href="/ko/connect" label="GRIDS에 문의하기" className={styles.contactLink} />
      </div>
    </BlogReading>

    <BlogReading>
      <footer className={styles.references} aria-labelledby="references-heading">
        <h2 id="references-heading">참고 자료</h2>
        <ol>
          <li id="source-msit"><a href="https://eiec.kdi.re.kr/policy/materialView.do?num=282149">과학기술정보통신부 — 2025년 부가통신사업 실태조사</a></li>
          <li id="source-brightlocal"><a href="https://www.brightlocal.com/research/local-consumer-review-survey/">BrightLocal — Local Consumer Review Survey 2026</a></li>
        </ol>
        <p className={styles.researchNote}><em>BrightLocal의 조사 결과는 미국 소비자를 대상으로 하며, 국내 소비자의 행동과 동일하게 해석할 수 없습니다.</em></p>
      </footer>
    </BlogReading>
  </>;
}
