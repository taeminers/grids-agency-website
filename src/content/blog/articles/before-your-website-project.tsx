import { BlogCallout, BlogReading, BlogVisual } from "@/components/blog/article-blocks";
import styles from "./before-your-website-project.module.css";

const questions = [
  { label: "목표", title: "방문자가 무엇을 하길 바라나요?", text: "상담 신청, 구매, 예약처럼 웹사이트에서 가장 중요한 행동 한 가지를 정해 보세요." },
  { label: "기능", title: "지금 꼭 필요한 것은 무엇인가요?", text: "첫 출시에서 필요한 기능과, 실제 사용자의 반응을 본 뒤 추가할 기능을 나눠 보세요." },
  { label: "운영", title: "출시 이후 누가 관리하나요?", text: "내용 수정과 문의 확인을 누가 담당할지에 따라 필요한 관리 기능도 달라집니다." },
];

// This article owns its body. Other posts can use entirely different layouts.
export default function BeforeYourWebsiteProject() {
  return <>
    <BlogReading>
      <p>웹사이트를 만들기로 했지만, 어디서부터 설명해야 할지 막막할 수 있습니다. 마음에 드는 사이트 몇 개를 모아 두는 것도 좋지만, 견적을 구체적으로 만드는 데에는 그보다 먼저 필요한 이야기가 있습니다.</p>
      <p><strong>어떤 문제를 해결하고 싶은지, 첫 출시에서 어디까지 만들지, 이후에는 어떻게 운영할지.</strong> 이 세 가지가 정리되면 디자인과 개발에 대한 대화도 훨씬 선명해집니다.</p>
    </BlogReading>

    <BlogVisual size="headline">
      <section className={styles.questionGrid} aria-label="첫 상담 전에 정리할 질문">
        {questions.map(question => <div className={styles.question} key={question.label}>
          <span className={styles.label}>{question.label}</span>
          <h2>{question.title}</h2>
          <p>{question.text}</p>
        </div>)}
      </section>
    </BlogVisual>

    <BlogReading>
      <h2>페이지 수보다, 고객의 다음 행동을 먼저 생각합니다.</h2>
      <p>회사 소개 페이지가 필요한 이유도 결국 고객이 회사를 이해하고 신뢰하도록 돕기 위해서입니다. 프로젝트의 출발점을 단순히 “페이지 다섯 개”로 정하기보다, 방문자가 무엇을 이해하고 어떤 행동을 해야 하는지부터 정해 보세요.</p>
      <p>예를 들어 문의를 늘리는 것이 목표라면, 서비스 설명과 작업 사례, 문의 동선이 서로 자연스럽게 연결되어야 합니다. 페이지 수가 같더라도 필요한 콘텐츠와 기능은 달라질 수 있습니다.</p>

      <h2>첫 출시의 범위와, 나중에 확장할 범위를 나눕니다.</h2>
      <p>처음 떠오른 모든 기능을 한 번에 만들 필요는 없습니다. 고객에게 서비스를 설명하고 문의를 받는 것이 우선이라면, 첫 버전은 그 흐름에 집중할 수 있습니다. 이후 실제 문의와 운영 경험을 바탕으로 예약이나 결제 기능을 검토하는 방식입니다.</p>
      <ul>
        <li>첫 출시에서 반드시 작동해야 하는 기능</li>
        <li>직접 운영해 본 뒤 필요성을 판단할 기능</li>
        <li>외부 서비스와 연결해야 하는 부분</li>
      </ul>
      <p>이렇게 나누면 무엇이 견적에 포함되어 있는지 확인하기 쉽고, 이후 추가 요청에 대해서도 같은 기준으로 대화할 수 있습니다.</p>

      <BlogCallout title="완성된 기획서가 없어도 괜찮습니다.">
        <p>사업 소개, 해결하고 싶은 문제, 참고 사이트, 희망 일정 정도만 준비해도 대화를 시작할 수 있습니다. 확정되지 않은 부분은 그대로 표시해 두고, 상담을 통해 함께 구체화하세요.</p>
      </BlogCallout>

      <h2>웹사이트가 완성된 다음의 운영도 함께 정합니다.</h2>
      <p>새 소식을 자주 올리거나 서비스 내용을 직접 수정해야 한다면, 담당자가 편하게 사용할 수 있는 관리 방식이 필요합니다. 반대로 내용이 거의 바뀌지 않는 사이트라면 더 단순한 구성이 적합할 수 있습니다.</p>
      <p>도메인과 호스팅 관리, 문의 수신, 콘텐츠 수정 담당자까지 미리 이야기해 두세요. 제작 범위뿐 아니라 출시 이후의 업무도 예상할 수 있어야, 비즈니스에 맞는 웹사이트를 만들 수 있습니다.</p>
    </BlogReading>
  </>;
}
