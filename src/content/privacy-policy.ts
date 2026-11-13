export type PrivacyBlock =
  | { type: "paragraph" | "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };
export type PrivacySection = { id: string; title: string; blocks: PrivacyBlock[] };
const p = (text: string): PrivacyBlock => ({ type: "paragraph", text });
const h = (text: string): PrivacyBlock => ({ type: "heading", text });
const list = (...items: string[]): PrivacyBlock => ({ type: "list", items });
const table = (headers: string[], rows: string[][]): PrivacyBlock => ({ type: "table", headers, rows });

// Owner-supplied policy, 2026-11-13. Copy approval is separate from verification
// of provider settings and operational claims; publication remains draft-gated.
const ko = {
  title: "개인정보 처리방침",
  introduction: "그리즈(GRIDS AGENCY, 이하 '그리즈')는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.",
  scope: "본 개인정보 처리방침은 그리즈가 운영하는 웹사이트(https://gridsagency.com)에서 개인정보를 처리하는 목적, 항목, 보유 기간 및 보호 조치 등에 관한 사항을 안내합니다.",
  draftLabel: "공개 전 검토용 초안",
  draftDescription: "제공해 주신 방침을 반영한 검토본입니다. 이메일 자동 삭제, 계정 MFA, 서비스별 보관 설정 및 국외 이전 세부사항의 확인이 완료되기 전까지 공개되지 않습니다.",
  effective: "시행일", pendingDate: "공개일 확정 전", version: "버전", contact: "개인정보 문의",
  effectiveStatement: "시행일: 2026년 11월 13일",
  sections: [
    { id: "purposes", title: "제1조. 개인정보의 처리 목적 및 항목", blocks: [
      p("그리즈는 다음의 목적을 위해 필요한 범위에서 개인정보를 처리합니다."),
      h("1. 프로젝트 문의 및 상담"),
      list("처리 목적: 프로젝트 문의 응대, 서비스 상담, 견적 안내 및 계약 체결을 위한 사전 협의", "필수 항목: 이름, 이메일 주소, 요청 서비스, 예산 범위", "선택 항목: 회사·팀 이름, 프로젝트 상세 내용", "조건부 필수 항목: '기타' 서비스 선택 시 상세 내용", "처리 근거: 「개인정보 보호법」 제15조 제1항 제4호(계약 체결 과정에서 정보주체의 요청에 따른 조치에 필요한 경우)"),
      p("문의 양식으로 제출된 정보는 EmailJS를 통해 그리즈의 업무용 이메일로 전달되며, 웹사이트 자체 데이터베이스에는 저장되지 않습니다."),
      h("2. 웹사이트 이용 통계 및 서비스 개선"),
      list("처리 목적: 웹사이트 방문 현황 분석, 이용 환경 개선 및 광고 성과 측정", "처리 항목: 방문 페이지, 접속 일시, 브라우저 및 기기 정보, 쿠키·이용자 식별자, 웹사이트 내 상호작용 정보 등", "이용 서비스: Google Analytics 4, Google Tag Manager 및 Google Ads 관련 측정 기능"),
      p("분석 및 광고 측정 과정에서는 서비스 설정에 따라 추가적인 정보가 처리될 수 있습니다. 해당 정보의 처리에는 관련 법령에서 요구하는 적법한 근거와 절차가 적용됩니다."),
    ] },
    { id: "retention", title: "제2조. 개인정보의 처리 및 보유 기간", blocks: [
      p("그리즈는 개인정보를 처리 목적 달성에 필요한 기간 동안 보유합니다."),
      table(["구분", "보유 기간"], [["계약으로 이어지지 않은 프로젝트 문의 정보", "최종 상담 종료일로부터 1년"], ["EmailJS 이메일 발송 이력", "7일"], ["Google Analytics 이벤트 데이터", "2개월"], ["Google Analytics 사용자 데이터", "14개월"], ["계약 및 거래 관련 정보", "관련 법령에 따른 보존기간"]]),
      p("프로젝트 문의 정보는 Google Workspace(Gmail)를 통해 보관하며, 보유 기간이 만료된 문의 이메일은 자동화된 삭제 절차를 통해 삭제합니다."),
      p("관련 법령에 따라 별도의 보존 의무가 있는 경우에는 해당 법령에서 정한 기간 동안 보관합니다."),
      p("외부 서비스의 기술적·보안 목적 기록이나 백업 데이터에는 별도의 보관 및 삭제 정책이 적용될 수 있습니다."),
    ] },
    { id: "disclosure", title: "제3조. 개인정보의 제3자 제공", blocks: [
      p("그리즈는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다."),
      p("다만, 정보주체의 동의를 받거나 관련 법령에 따라 허용되는 경우에는 필요한 범위에서 개인정보를 제공할 수 있습니다."),
      p("외부 서비스 이용에 따른 개인정보 처리위탁 및 국외 이전에 관한 사항은 아래에서 별도로 안내합니다."),
    ] },
    { id: "providers", title: "제4조. 개인정보 처리업무의 위탁 및 외부 서비스 이용", blocks: [
      p("그리즈는 웹사이트 운영과 문의 처리를 위해 다음과 같은 외부 서비스를 이용합니다."),
      table(["서비스 제공업체", "이용 목적"], [["EmailJS Pte. Ltd.", "프로젝트 문의 이메일 전송 및 발송 이력 관리"], ["Google Workspace", "문의 이메일 수신 및 보관"], ["Vercel Inc.", "웹사이트 호스팅 및 인프라 운영"], ["Google Analytics / Google Ads", "웹사이트 이용 통계 및 광고 성과 측정"]]),
      p("각 서비스의 개인정보 처리 역할은 실제 서비스 계약 및 운영 방식에 따라 구분되며, 그리즈는 관련 법령에 따라 필요한 보호 조치를 시행합니다."),
    ] },
    { id: "transfers", title: "제5조. 개인정보의 국외 이전", blocks: [
      p("그리즈는 웹사이트 운영 및 문의 처리를 위해 해외 사업자의 서비스를 이용하고 있으며, 서비스 제공 과정에서 개인정보가 국외로 이전되거나 처리될 수 있습니다."),
      h("1. EmailJS"),
      list("이전받는 자: EmailJS Pte. Ltd.", "연락처: gdpr@emailjs.zendesk.com", "이전 국가: 미국", "이전 항목: 이름, 이메일 주소, 회사·팀 이름, 요청 서비스, 예산 범위, 프로젝트 내용 및 요청 관련 기술정보", "이전 목적: 프로젝트 문의 이메일 전송 및 발송 이력 관리", "이전 시기 및 방법: 문의 제출 시 HTTPS 통신을 통한 전송", "보유 기간: 발송 이력 7일. 기타 기술·보안 기록은 별도 정책 적용", "이전 거부: 문의 양식을 제출하지 않음으로써 해당 전송을 거부할 수 있으며, 이 경우 온라인 프로젝트 문의 접수가 제한됩니다."),
      h("2. Google Workspace"),
      list("서비스 제공업체: Google 및 관련 서비스 제공 법인", "처리 항목: 문의 이메일의 발신자·수신자 정보, 제목, 본문 및 관련 기술정보", "처리 목적: 이메일 수신, 저장 및 회신", "처리 시기 및 방법: 문의 이메일 송수신 및 보관 과정에서 네트워크를 통한 처리", "보유 기간: 그리즈의 문의 보관 정책에 따르며, 별도 시스템 기록에는 서비스 제공업체의 정책이 적용될 수 있습니다."),
      h("3. Vercel"),
      list("이전받는 자: Vercel Inc.", "연락처: privacy@vercel.com", "처리 국가: 미국을 포함한 서비스 인프라 운영 국가", "처리 항목: IP 주소, 요청 URL, 접속 시간, 브라우저 및 기기 관련 기술정보", "처리 목적: 웹사이트 제공, 인프라 운영 및 보안", "처리 시기 및 방법: 웹사이트 접속 및 이용 시 네트워크를 통한 처리", "보유 기간: 서비스별 로그 및 보안 기록 보관 정책에 따름"),
      h("4. Google Analytics 및 광고 측정 서비스"),
      list("서비스 제공업체: Google 및 관련 서비스 제공 법인", "처리 항목: 쿠키·이용자 식별자, 방문 및 이용 이벤트, 브라우저·기기 정보 등", "처리 목적: 웹사이트 이용 통계 분석 및 광고 성과 측정", "처리 시기 및 방법: 웹사이트 방문 및 이벤트 발생 시 네트워크를 통한 전송", "보유 기간: Google Analytics 이벤트 데이터 2개월, 사용자 데이터 14개월. 다른 서비스 기록에는 별도 정책이 적용될 수 있습니다."),
      p("국외 이전에 관한 문의 및 개인정보 관련 권리 행사 요청은 kyle@gridsagency.com으로 접수할 수 있습니다."),
      p("그리즈는 국외 이전과 관련하여 「개인정보 보호법」 제28조의8 등 관련 법령에서 정한 요건을 준수합니다."),
    ] },
    { id: "cookies", title: "제6조. 쿠키 및 자동 수집 장치의 운영", blocks: [
      p("그리즈는 웹사이트 이용 현황을 분석하고 서비스 품질을 개선하기 위해 쿠키(Cookie) 및 유사 기술을 사용합니다."),
      p("Google Analytics 4를 통해 웹사이트 방문 및 이용 현황을 분석하며, Google Ads 관련 기능을 통해 광고 유입과 전환 성과를 측정할 수 있습니다."),
      p("Google Signals 기능은 비활성화되어 있습니다. 다만, 별도의 사용자 제공 데이터 수집 기능은 서비스 설정에 따라 처리될 수 있으며, Google Signals의 비활성화가 모든 광고·분석 정보 처리의 중단을 의미하지는 않습니다."),
      p("이용자는 브라우저 설정을 통해 쿠키를 삭제하거나 저장을 제한할 수 있습니다. Google Analytics 차단 브라우저 부가기능 등 지원되는 외부 도구를 이용할 수도 있습니다."),
      p("다만, 이러한 방법이 모든 분석·광고 요청을 차단하거나 이미 수집된 정보를 삭제하는 것은 아닙니다."),
      p("웹사이트 화면 설정과 방문 세션의 상태 유지를 위해 브라우저의 로컬 저장소 및 세션 저장소가 사용될 수 있습니다."),
    ] },
    { id: "deletion", title: "제7조. 개인정보의 파기 절차 및 방법", blocks: [
      p("그리즈는 개인정보의 보유 기간이 경과하거나 처리 목적이 달성되어 해당 정보가 불필요하게 된 경우 지체 없이 파기합니다."),
      list("이메일로 보관된 문의 정보는 보유 기간에 따라 삭제합니다.", "EmailJS 발송 이력은 서비스의 보관 및 삭제 정책에 따라 관리합니다.", "전자적 파일은 복구 또는 재생이 어렵도록 안전한 방법으로 삭제합니다."),
      p("관련 법령에 따라 보존이 필요한 개인정보는 해당 목적 이외의 용도로 이용되지 않도록 관리합니다."),
    ] },
    { id: "security", title: "제8조. 개인정보의 안전성 확보 조치", blocks: [
      p("그리즈는 개인정보를 안전하게 관리하기 위해 다음과 같은 기술적·관리적 보호 조치를 시행합니다."),
      list("HTTPS를 통한 통신 구간 보호", "업무용 계정의 접근 권한 관리", "주요 서비스 계정의 다중 인증(MFA) 적용", "개인정보에 대한 접근 제한", "개인정보의 무단 접근 및 유출 방지를 위한 보안 관리"),
    ] },
    { id: "rights", title: "제9조. 정보주체의 권리 및 행사 방법", blocks: [
      p("이용자는 그리즈에 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지 등을 요청할 수 있으며, 동의에 근거한 처리의 경우 동의 철회를 요청할 수 있습니다."),
      p("권리 행사 및 개인정보 관련 문의는 아래 개인정보 보호책임자에게 이메일 또는 전화로 접수할 수 있습니다."),
      p("그리즈는 관련 법령에 따라 필요한 조치를 시행하며, 법령에서 정한 사유가 있는 경우 일부 요청이 제한될 수 있습니다."),
    ] },
    { id: "controller", title: "제10조. 개인정보 보호책임자", blocks: [
      p("그리즈는 개인정보 보호 및 관련 문의 처리를 위해 아래와 같이 개인정보 보호책임자를 지정합니다."),
      list("상호: 그리즈 (GRIDS AGENCY)", "개인정보 보호책임자: Kyle Lee (대표)", "이메일: kyle@gridsagency.com", "전화번호: 010-6333-1509", "웹사이트: https://gridsagency.com"),
      p("개인정보 침해에 대한 신고 및 상담은 개인정보침해신고센터(국번 없이 118) 등 관계 기관을 통해 문의할 수 있습니다."),
    ] },
    { id: "changes", title: "제11조. 개인정보 처리방침의 변경", blocks: [
      p("본 개인정보 처리방침은 관련 법령 및 서비스 운영 정책에 따라 변경될 수 있습니다."),
      p("처리방침이 변경되는 경우 웹사이트를 통해 변경 내용과 시행일을 안내합니다."),
    ] },
  ] satisfies PrivacySection[],
};

const en: typeof ko = {
  title: "Privacy policy",
  introduction: "그리즈 (GRIDS AGENCY, referred to as ‘GRIDS’) values your personal information and complies with applicable laws, including the Korean Personal Information Protection Act (PIPA).",
  scope: "This policy explains the purposes, categories, retention periods and safeguards for personal information processed through GRIDS’ website (https://gridsagency.com).",
  draftLabel: "Draft for review · not yet published",
  draftDescription: "This review copy reflects the policy supplied by the owner. Publication remains disabled pending verification of automated email deletion, account MFA, service retention settings and international-transfer details.",
  effective: "Effective date", pendingDate: "Pending publication", version: "Version", contact: "Privacy contact",
  effectiveStatement: "Effective date: November 13, 2026",
  sections: [
    { id: "purposes", title: "Article 1. Purposes and categories", blocks: [
      p("GRIDS processes personal information to the extent necessary for the following purposes."),
      h("1. Project inquiries and consultations"),
      list("Purpose: responding to project inquiries, service consultations, quotations and pre-contract discussions", "Required: name, email address, requested services and budget range", "Optional: company/team name and project details", "Conditionally required: details when selecting Other services", "Basis: PIPA Article 15(1)(4), where necessary to take steps at the data subject’s request during the process of entering into a contract"),
      p("Information submitted through the inquiry form is delivered through EmailJS to GRIDS’ business email account and is not stored in the website’s own database."),
      h("2. Website statistics and service improvement"),
      list("Purpose: analysing visits, improving the user experience and measuring advertising performance", "Categories: pages visited, access times, browser/device information, cookies/user identifiers and website interactions", "Services: Google Analytics 4, Google Tag Manager and Google Ads-related measurement features"),
      p("Additional information may be processed depending on analytics and advertising settings. Such processing is subject to the lawful grounds and procedures required by applicable law."),
    ] },
    { id: "retention", title: "Article 2. Retention periods", blocks: [
      p("GRIDS retains personal information for the period necessary to fulfil its processing purpose."),
      table(["Category", "Retention"], [["Project inquiries that do not lead to a contract", "One year after the final consultation closes"], ["EmailJS sending history", "7 days"], ["Google Analytics event data", "2 months"], ["Google Analytics user data", "14 months"], ["Contract and transaction records", "Periods required by applicable law"]]),
      p("Project inquiries are retained through Google Workspace (Gmail). Inquiry emails whose retention period has expired are deleted through an automated deletion procedure."),
      p("Where a separate legal retention obligation applies, the information is retained for the period specified by that law."),
      p("Technical/security records and backups held by external services may be subject to separate retention and deletion policies."),
    ] },
    { id: "disclosure", title: "Article 3. Third-party disclosure", blocks: [
      p("In principle, GRIDS does not disclose your personal information to third parties."),
      p("Information may be disclosed to the necessary extent with your consent or where otherwise permitted by law."),
      p("Outsourced processing and international transfers arising from external services are described separately below."),
    ] },
    { id: "providers", title: "Article 4. Outsourcing and external services", blocks: [
      p("GRIDS uses the following services to operate the website and handle inquiries."),
      table(["Provider", "Purpose"], [["EmailJS Pte. Ltd.", "Sending project inquiry emails and managing sending history"], ["Google Workspace", "Receiving and storing inquiry emails"], ["Vercel Inc.", "Website hosting and infrastructure"], ["Google Analytics / Google Ads", "Website statistics and advertising measurement"]]),
      p("Each provider’s processing role depends on its actual contract and operating arrangements. GRIDS implements the safeguards required by applicable law."),
    ] },
    { id: "transfers", title: "Article 5. International transfers", blocks: [
      p("GRIDS uses overseas providers to operate the website and handle inquiries. Personal information may be transferred or processed overseas when these services are provided."),
      h("1. EmailJS"),
      list("Recipient: EmailJS Pte. Ltd.", "Contact: gdpr@emailjs.zendesk.com", "Country: United States", "Categories: name, email address, company/team name, requested services, budget range, project details and request-related technical information", "Purpose: delivering project inquiry emails and managing sending history", "Timing/method: HTTPS transmission when an inquiry is submitted", "Retention: sending history for 7 days; separate policies apply to other technical/security records", "Refusal: you may refuse this transmission by not submitting the form; online project inquiry submission will then be unavailable."),
      h("2. Google Workspace"),
      list("Provider: Google and relevant service entities", "Categories: email sender/recipient information, subject, body and related technical information", "Purpose: receiving, storing and replying to emails", "Timing/method: network processing when emails are sent, received and stored", "Retention: GRIDS’ inquiry retention policy; provider policies may apply to separate system records."),
      h("3. Vercel"),
      list("Recipient: Vercel Inc.", "Contact: privacy@vercel.com", "Countries: United States and other countries where service infrastructure operates", "Categories: IP address, requested URL, access time and browser/device technical information", "Purpose: website delivery, infrastructure operation and security", "Timing/method: network processing when the website is accessed and used", "Retention: service-specific log and security-record policies"),
      h("4. Google Analytics and advertising measurement"),
      list("Provider: Google and relevant service entities", "Categories: cookies/user identifiers, visit/usage events and browser/device information", "Purpose: website statistics and advertising measurement", "Timing/method: network transmission on visits and events", "Retention: Google Analytics event data for 2 months and user data for 14 months; separate policies may apply to other service records."),
      p("International-transfer questions and privacy-rights requests may be submitted to kyle@gridsagency.com."),
      p("GRIDS complies with applicable international-transfer requirements, including PIPA Article 28-8."),
    ] },
    { id: "cookies", title: "Article 6. Cookies and automatic collection", blocks: [
      p("GRIDS uses cookies and similar technologies to analyse website use and improve service quality."),
      p("Google Analytics 4 analyses visits and usage. Google Ads-related features may measure advertising referrals and conversions."),
      p("Google Signals is disabled. Separate user-provided data collection may operate according to service settings; disabling Google Signals does not stop all advertising or analytics processing."),
      p("You may delete or restrict cookies in browser settings or use supported external tools such as the Google Analytics opt-out browser add-on."),
      p("These methods do not necessarily block every analytics/advertising request or delete information already collected."),
      p("Browser local storage and session storage may be used for display preferences and visit-session state."),
    ] },
    { id: "deletion", title: "Article 7. Destruction procedures and methods", blocks: [
      p("GRIDS destroys personal information without delay when its retention period expires or it is no longer needed following fulfilment of its purpose."),
      list("Inquiry emails are deleted according to their retention period.", "EmailJS history is managed under the service’s retention/deletion policy.", "Electronic files are securely deleted in a manner that makes recovery or reproduction difficult."),
      p("Information retained under law is managed so that it is not used for other purposes."),
    ] },
    { id: "security", title: "Article 8. Security safeguards", blocks: [
      p("GRIDS implements the following technical and organisational safeguards to protect personal information."),
      list("HTTPS protection for communications", "Business account access-right management", "Multi-factor authentication (MFA) for key service accounts", "Restricted access to personal information", "Security management to prevent unauthorised access and disclosure"),
    ] },
    { id: "rights", title: "Article 9. Your rights", blocks: [
      p("You may request access, correction, deletion or restriction of processing, and withdraw consent for processing based on consent."),
      p("Please submit rights requests and privacy questions by email or telephone to the privacy officer below."),
      p("GRIDS takes the measures required by law. Certain requests may be restricted where a statutory reason applies."),
    ] },
    { id: "controller", title: "Article 10. Privacy officer", blocks: [
      p("GRIDS designates the following privacy officer to handle privacy matters and inquiries."),
      list("Business: 그리즈 (GRIDS AGENCY)", "Privacy officer: Kyle Lee (Representative)", "Email: kyle@gridsagency.com", "Telephone: 010-6333-1509", "Website: https://gridsagency.com"),
      p("You may also contact the Personal Information Infringement Report Center (118 within Korea) or other relevant authorities for complaints or advice."),
    ] },
    { id: "changes", title: "Article 11. Changes to this policy", blocks: [
      p("This policy may change in response to applicable laws or service operating policies."),
      p("Changes and their effective date will be announced through the website."),
    ] },
  ],
};

export function getPrivacyCopy(locale: string) {
  return locale === "ko" ? ko : en;
}
