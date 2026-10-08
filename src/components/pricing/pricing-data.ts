// Source: src/components/knowledge/quotation-rules.md.
// Run npm run pricing:sync after editing rates. Package scopes remain reviewed proposals.
import quotationRates from "./quotation-rates.generated.json";

type PricedRateId = keyof typeof quotationRates;
export type Copy = { ko: string; en: string };
const text = (ko: string, en: string): Copy => ({ ko, en });
export type Rate = {
  id: string;
  label: Copy;
  amount?: number;
  mode: "from" | "fixed" | "included" | "custom" | "excluded";
  unit?: Copy;
  detail?: Copy;
};
export type RateSection = { id: string; title: Copy; note?: Copy; rows: Rate[] };
const from = (id: PricedRateId, ko: string, en: string, detail?: Copy, unit?: Copy): Rate =>
  ({ id, label: text(ko, en), amount: quotationRates[id], mode: "from", detail, unit });
const fixed = (id: PricedRateId, ko: string, en: string, unit?: Copy): Rate =>
  ({ id, label: text(ko, en), amount: quotationRates[id], mode: "fixed", unit });
const included = (id: string, ko: string, en: string, detail?: Copy): Rate =>
  ({ id, label: text(ko, en), mode: "included", detail });
const custom = (id: string, ko: string, en: string, detail?: Copy): Rate =>
  ({ id, label: text(ko, en), mode: "custom", detail });

export const rateSections: RateSection[] = [
  {
    id: "production", title: text("기본 제작비", "Production"),
    note: text("프로젝트 유형에 따른 시작 금액입니다. 실제 범위와 난이도를 확인한 뒤 견적을 확정합니다.", "Starting rates by project type. The final quote depends on the confirmed scope and complexity."),
    rows: [
      from("landing", "랜딩페이지", "Landing page", text("기획 · UI/UX · 반응형 개발 · 기본 인터랙션 · 문의 폼 · SEO · Analytics · 배포 · QA", "Planning, UI/UX, responsive development, basic interactions, inquiry form, SEO, analytics, deployment and QA")),
      from("brand", "기업 / 브랜드 홈페이지", "Company / brand website", text("최대 5페이지 · 맞춤 디자인 · 기획 / 개발 · 문의 폼 · SEO · Analytics · 배포 · QA · 기본 수정 2회", "Up to 5 pages, custom design, planning and development, inquiry form, SEO, analytics, deployment, QA and 2 revision rounds")),
      from("premium", "고급 브랜드 홈페이지", "Advanced brand website", text("더 높은 수준의 디자인, 인터랙션 또는 브랜드 표현", "Higher design, interaction or brand-expression requirements")),
      from("commerce", "쇼핑몰", "E-commerce", text("상품 · 주문 · 결제 등 커머스 기능. 세부 기능에 따라 별도 산정", "Products, orders and payments; detailed features are scoped separately")),
      from("mvp", "웹서비스 / MVP", "Web service / MVP", text("회원 · 데이터베이스 · 비즈니스 로직을 포함하는 맞춤 웹서비스", "Custom web services with accounts, a database and business logic")),
      from("platform", "복잡한 웹서비스 / 플랫폼", "Complex web service / platform", text("복잡한 권한 · 사용자 유형 · 결제 · 관리자 · 외부 연동. 개별 산정 원칙", "Complex roles, user types, payments, administration and integrations. Individually quoted")),
      from("existing", "기존 서비스 수정 / 추가 개발", "Changes to an existing service", text("최소 작업비. 기존 코드 분석과 작업 난이도에 따라 산정", "Minimum engagement; subject to code review and implementation difficulty")),
    ],
  },
  {
    id: "pages", title: text("페이지 추가", "Additional pages"),
    note: text("기업 / 브랜드 홈페이지는 기본 5페이지를 포함합니다. 페이지 수가 많거나 반복 구조인 경우 별도 조정할 수 있습니다.", "Company / brand websites include 5 pages. Large page counts and repeated layouts may be adjusted separately."),
    rows: [
      fixed("page", "일반 페이지", "Standard page", text("페이지", "page")),
      fixed("advanced-page", "고급 페이지", "Advanced page", text("페이지", "page")),
      from("special-page", "특수 인터랙션 / 고난도 디자인 페이지", "Special interaction / complex design page", undefined, text("페이지", "page")),
    ],
  },
  {
    id: "features", title: text("추가 기능", "Additional features"),
    note: text("별도 표시가 없는 금액은 시작가입니다. 기능의 범위와 복잡도에 따라 달라집니다.", "Unless stated otherwise, these are starting rates and vary with feature scope and complexity."),
    rows: [
      included("form", "기본 문의 폼", "Basic inquiry form"),
      from("advanced-form", "고급 문의 폼", "Advanced inquiry form"),
      from("board", "게시판", "Bulletin board"),
      from("blog", "블로그 / 뉴스", "Blog / news"),
      from("cms", "CMS", "CMS"),
      from("login", "회원가입 / 로그인", "Sign-up / login"),
      from("social", "소셜 로그인", "Social login", undefined, text("서비스", "provider")),
      from("profile", "사용자 마이페이지", "User account page"),
      from("search", "검색", "Search"),
      from("payment", "결제", "Payments"),
      from("booking", "예약", "Bookings"),
      from("admin", "관리자 페이지", "Admin panel"),
      from("api", "외부 API 연동", "External API integration"),
      from("email", "이메일 자동 발송", "Automated emails"),
      from("sms", "SMS / 알림톡", "SMS / Kakao notifications"),
      from("dashboard", "대시보드 / 통계", "Dashboard / analytics"),
      custom("ai", "AI 기능", "AI features"),
      custom("realtime", "실시간 기능", "Real-time features"),
      custom("custom", "기타 커스텀 기능", "Other custom features"),
    ],
  },
  {
    id: "languages", title: text("다국어", "Languages"),
    note: text("번역 비용은 포함하지 않으며, 번역문은 기본적으로 고객이 제공합니다.", "Translation is excluded. Translated copy is normally supplied by the client."),
    rows: [included("primary-language", "기본 언어 1개", "One primary language"), from("language", "추가 언어", "Additional language", undefined, text("언어", "language"))],
  },
  {
    id: "design", title: text("디자인 및 인터랙션", "Design & interaction"),
    rows: [included("basic-design", "일반 디자인 / 인터랙션", "Standard design / interaction"), from("interaction", "고급 인터랙션", "Advanced interactions"), custom("webgl", "WebGL · 3D · 고급 스크롤 인터랙션", "WebGL, 3D and advanced scroll interactions")],
  },
  {
    id: "external", title: text("외부 비용", "Third-party costs"),
    note: text("개발 견적에 포함하지 않습니다. 필요한 비용은 별도로 안내합니다.", "Excluded from development fees. Applicable costs are communicated separately."),
    rows: [
      ["domain", "도메인", "Domain"], ["hosting", "서버 / 호스팅", "Server / hosting"],
      ["api-usage", "외부 API 사용료", "External API usage"], ["pg", "PG사 비용", "Payment gateway fees"],
      ["messaging", "SMS / 알림톡 발송 비용", "SMS / notification delivery"], ["library", "유료 라이브러리", "Paid libraries"],
      ["font", "유료 폰트", "Paid fonts"], ["assets", "이미지 / 영상 구매", "Image / video purchases"],
      ["external-other", "기타 외부 서비스", "Other external services"],
    ].map(([id, ko, en]) => ({ id, label: text(ko, en), mode: "excluded" })),
  },
  {
    id: "changes", title: text("범위 변경 / 추가 개발", "Scope changes"),
    note: text("최초 합의한 범위를 벗어난 작업은 별도 견적합니다.", "Work outside the originally agreed scope is quoted separately."),
    rows: [
      custom("new-pages", "새로운 페이지", "New pages"), custom("new-features", "새로운 기능", "New features"),
      custom("new-integrations", "새로운 외부 서비스 연동", "New integrations"), custom("redesign", "승인된 디자인의 대규모 변경", "Major changes to approved designs"),
      custom("logic", "기존 비즈니스 로직 변경", "Changes to business logic"), custom("new-requirements", "진행 중 추가된 요구사항", "Requirements added during production"),
    ],
  },
  {
    id: "minimum", title: text("최소 수주 금액", "Minimum engagements"),
    note: text("계산 금액이 최소 수주 금액보다 낮으면 최소 금액을 적용합니다. 신규 홈페이지의 최소 금액은 기업 / 브랜드 홈페이지 시작가와 구분됩니다.", "The minimum applies if the calculation falls below it. The new-website minimum is distinct from the company / brand website starting rate."),
    rows: [fixed("min-landing", "랜딩페이지", "Landing page"), fixed("min-website", "신규 홈페이지", "New website"), fixed("min-mvp", "웹서비스 / MVP", "Web service / MVP"), fixed("min-existing", "기존 서비스 수정", "Existing service changes")],
  },
  {
    id: "vat", title: text("VAT 표시 예시", "VAT example"),
    note: text("모든 기준 금액은 VAT 별도입니다. 최종 견적에는 공급가액과 VAT를 구분해 표시합니다. 아래는 문서에 명시된 공급가액과 VAT의 표시 예시입니다.", "All reference prices exclude VAT. Final quotations show the supply amount and VAT separately. The example below uses the supply amount and VAT stated in the rules."),
    rows: [fixed("supply", "공급가액", "Supply amount"), fixed("vat-amount", "VAT", "VAT"), fixed("total", "총액", "Total")],
  },
];

const rates = new Map(rateSections.flatMap((section) => section.rows.map((rate) => [rate.id, rate] as const)));
export function getRate(id: string): Rate {
  const rate = rates.get(id);
  if (!rate) throw new Error(`Unknown quotation rate: ${id}`);
  return rate;
}

export type PackageTier = { summary: Copy; scope: Copy[]; extras: { id: string; quantity: number }[] };
export type ServicePackages = { id: string; description: Copy; tiers: PackageTier[] };
const extra = (id: string, quantity = 1) => ({ id, quantity });
const tier = (summary: Copy, scope: Copy[], extras: PackageTier["extras"] = []): PackageTier => ({ summary, scope, extras });

export const packageServices: ServicePackages[] = [
  { id: "landing", description: text("하나의 메시지에 집중하는 제품 소개와 캠페인 페이지.", "A focused launch page for a product, service or campaign."), tiers: [
    tier(text("빠르게 시작하는 한 페이지", "One page to get started"), [text("랜딩페이지 1개", "One landing page"), text("기획 · UI/UX · 반응형 개발", "Planning, UI/UX and responsive build"), text("기본 문의 폼 · SEO · Analytics", "Basic inquiry form, SEO and analytics"), text("기본 인터랙션 · 배포 · QA", "Basic interactions, deployment and QA")]),
    tier(text("문의 전환에 집중한 구성", "Built around qualified inquiries"), [text("Basic 구성 전체", "Everything in Basic"), text("고급 문의 폼 1개", "One advanced inquiry form")], [extra("advanced-form")]),
    tier(text("콘텐츠와 언어를 확장하는 구성", "Add content and another language"), [text("Plus 구성 전체", "Everything in Plus"), text("블로그 / 뉴스 모듈 1개", "One blog / news module"), text("추가 언어 1개 · 번역문 고객 제공", "One additional language; client supplies translations")], [extra("advanced-form"), extra("blog"), extra("language")]),
  ] },
  { id: "brand", description: text("비즈니스의 정보와 브랜드를 함께 담는 홈페이지.", "A complete home for your business and brand."), tiers: [
    tier(text("브랜드의 기본을 담은 홈페이지", "Your brand essentials"), [text("최대 5페이지 · 맞춤 디자인", "Up to 5 pages with custom design"), text("기획 · 반응형 개발 · 기본 인터랙션", "Planning, responsive build and basic interactions"), text("문의 폼 · SEO · Analytics · 배포 · QA", "Inquiry form, SEO, analytics, deployment and QA"), text("기본 수정 2회", "Two standard revision rounds")]),
    tier(text("직접 콘텐츠를 관리하는 홈페이지", "Manage your own content"), [text("Basic 구성 전체", "Everything in Basic"), text("일반 페이지 2개 추가 · 총 7페이지", "Two extra standard pages; 7 pages total"), text("CMS 1개", "One CMS")], [extra("page", 2), extra("cms")]),
    tier(text("더 많은 콘텐츠와 글로벌 접점", "More content, broader reach"), [text("Basic 구성 전체", "Everything in Basic"), text("일반 페이지 5개 추가 · 총 10페이지", "Five extra standard pages; 10 pages total"), text("CMS · 블로그 / 뉴스 각 1개", "One CMS and one blog / news module"), text("추가 언어 1개 · 고급 인터랙션 1개", "One extra language and one advanced interaction")], [extra("page", 5), extra("cms"), extra("blog"), extra("language"), extra("interaction")]),
  ] },
  { id: "premium", description: text("브랜드 표현과 디자인 완성도에 더 집중하는 웹 경험.", "A web experience with greater emphasis on brand expression and design."), tiers: [
    tier(text("디자인 중심의 브랜드 경험", "A design-led brand experience"), [text("최대 5페이지 구성안", "Proposed scope of up to 5 pages"), text("고급 브랜드 디자인 · 반응형 개발", "Advanced brand design and responsive build"), text("기획 · 배포 · QA", "Planning, deployment and QA"), text("WebGL / 3D 제외", "WebGL / 3D excluded")]),
    tier(text("운영과 인터랙션까지", "Add editing and interaction"), [text("Basic 구성 전체", "Everything in Basic"), text("CMS 1개 · 고급 인터랙션 1개", "One CMS and one advanced interaction")], [extra("cms"), extra("interaction")]),
    tier(text("확장된 브랜드 콘텐츠 경험", "An expanded brand experience"), [text("Plus 구성 전체", "Everything in Plus"), text("일반 페이지 5개 추가 · 총 10페이지", "Five extra standard pages; 10 pages total"), text("추가 언어 1개 · 번역문 고객 제공", "One additional language; client supplies translations")], [extra("cms"), extra("interaction"), extra("page", 5), extra("language")]),
  ] },
  { id: "commerce", description: text("상품 소개부터 주문과 결제까지 이어지는 온라인 스토어.", "An online store connecting products, orders and payments."), tiers: [
    tier(text("온라인 판매의 기본 구성", "The essentials for online sales"), [text("스토어 1개 · 기본 상품 / 주문 흐름", "One store with a basic product and order flow"), text("결제 흐름 1개", "One payment flow"), text("기획 · 디자인 · 개발 · 배포 · QA", "Planning, design, build, deployment and QA"), text("상품 수 / 배송 정책은 범위 확정 시 합의", "Product count and shipping rules agreed during scoping")]),
    tier(text("관리 업무까지 한곳에서", "Manage store operations"), [text("Basic 구성 전체", "Everything in Basic"), text("별도 맞춤 관리자 페이지 1개", "One additional custom admin panel")], [extra("admin")]),
    tier(text("판매 현황과 콘텐츠를 함께", "Sales insights and content"), [text("Plus 구성 전체", "Everything in Plus"), text("대시보드 / 통계 모듈 1개", "One dashboard / analytics module"), text("블로그 / 뉴스 모듈 1개", "One blog / news module")], [extra("admin"), extra("dashboard"), extra("blog")]),
  ] },
  { id: "mvp", description: text("핵심 가설을 검증하고 실제 사용자를 만나는 첫 웹서비스.", "A first web product to test an idea with real users."), tiers: [
    tier(text("핵심 기능에 집중한 첫 출시", "Launch the core experience"), [text("핵심 사용자 흐름 1개", "One core user journey"), text("기본 회원 기능 · 데이터베이스", "Basic accounts and a database"), text("합의한 핵심 비즈니스 로직", "Agreed core business logic"), text("기획 · 디자인 · 개발 · 배포 · QA", "Planning, design, build, deployment and QA")]),
    tier(text("사용자와 운영자를 위한 구성", "Tools for users and operators"), [text("Basic 구성 전체", "Everything in Basic"), text("관리자 페이지 1개", "One admin panel"), text("사용자 마이페이지 1개", "One user account page")], [extra("admin"), extra("profile")]),
    tier(text("결제와 외부 서비스 연결", "Payments and integrations"), [text("Plus 구성 전체", "Everything in Plus"), text("결제 흐름 1개", "One payment flow"), text("외부 API 연동 1개", "One external API integration")], [extra("admin"), extra("profile"), extra("payment"), extra("api")]),
  ] },
  { id: "platform", description: text("여러 사용자와 운영 흐름이 연결되는 플랫폼. 상세 설계 후 금액을 확정합니다.", "A platform connecting multiple user types and workflows. Pricing is finalized after detailed scoping."), tiers: [
    tier(text("플랫폼의 핵심 구조", "The platform foundation"), [text("서로 다른 사용자 유형 2개 구성안", "Proposed scope of two user types"), text("권한 체계 · 결제 흐름 · 관리자", "Roles, a payment flow and administration"), text("외부 서비스 연동 1개 구성안", "Proposed scope of one external integration"), text("세부 기능과 난이도 개별 검토", "Individual review of features and complexity")]),
    tier(text("운영 지표와 추가 연동", "Operational insights and connections"), [text("Basic 구성 전체", "Everything in Basic"), text("대시보드 / 통계 모듈 1개", "One dashboard / analytics module"), text("외부 API 연동 1개 추가", "One additional external API integration")], [extra("dashboard"), extra("api")]),
    tier(text("예약과 다국어 확장", "Bookings and multilingual support"), [text("Plus 구성 전체", "Everything in Plus"), text("예약 흐름 1개", "One booking flow"), text("추가 언어 1개 · 번역문 고객 제공", "One additional language; client supplies translations")], [extra("dashboard"), extra("api"), extra("booking"), extra("language")]),
  ] },
  { id: "existing", description: text("이미 운영 중인 서비스에 필요한 개선과 기능을 더합니다.", "Improve a live service or add the functionality it needs."), tiers: [
    tier(text("작은 개선부터", "Start with a focused change"), [text("기존 코드 검토", "Review of existing code"), text("합의한 소규모 수정 1건", "One agreed small change"), text("변경 범위 QA", "QA for the changed scope"), text("코드 상태 확인 후 확정", "Confirmed after reviewing code condition")]),
    tier(text("콘텐츠 운영 기능 추가", "Add content management"), [text("Basic 구성 전체", "Everything in Basic"), text("CMS 1개 추가", "Add one CMS")], [extra("cms")]),
    tier(text("페이지와 문의 흐름 개선", "Expand pages and inquiry flows"), [text("Plus 구성 전체", "Everything in Plus"), text("일반 페이지 2개 추가", "Two additional standard pages"), text("고급 문의 폼 1개 · 이메일 자동 발송 1개", "One advanced inquiry form and one automated email flow")], [extra("cms"), extra("page", 2), extra("advanced-form"), extra("email")]),
  ] },
];

function packageSubtotal(service: ServicePackages, tier: PackageTier): number {
  const amount = (id: string) => {
    const value = getRate(id).amount;
    if (value === undefined) throw new Error(`No documented price for ${id}`);
    return value;
  };
  return amount(service.id) + tier.extras.reduce((total, item) => total + amount(item.id) * item.quantity, 0);
}

const minimumIds: Record<string, PricedRateId> = {
  landing: "min-landing", brand: "min-website", premium: "min-website",
  commerce: "min-website", mvp: "min-mvp", platform: "min-mvp", existing: "min-existing",
};

export function packageMinimumAdjustment(service: ServicePackages, tier: PackageTier): number {
  const minimumId = minimumIds[service.id];
  if (!minimumId) throw new Error(`Unknown package minimum: ${service.id}`);
  return Math.max(0, quotationRates[minimumId] - packageSubtotal(service, tier));
}

export function packageAmount(service: ServicePackages, tier: PackageTier): number {
  return packageSubtotal(service, tier) + packageMinimumAdjustment(service, tier);
}
