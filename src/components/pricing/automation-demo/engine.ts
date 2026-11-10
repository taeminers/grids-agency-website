import { l, type Industry, type Locale, type Scenario } from "./scenarios";
import { getClinicSources, type DemoSource } from "./clinic-sources";

export type DemoInput = {
  industry: Industry;
  scenario: Scenario;
  locale: Locale;
  customMessage?: string;
};
export type DemoResult = {
  mode: "scenario" | "custom";
  category: string;
  intent: string;
  fields: { label: string; value: string }[];
  confirmation: string;
  record: { customer: string; channel: string; owner: string; industry: string; reference: string };
  reply: string;
  tasks: { title: string; owner: string }[];
  sources: DemoSource[];
};

// An adapter boundary: an eventual API can return this same result contract.
// The current implementation is local, deterministic, and never sends data.
export type AutomationProcessor = (input: DemoInput, signal: AbortSignal) => Promise<DemoResult>;

export function buildDemoResult(input: DemoInput): DemoResult {
  const { industry, scenario, locale, customMessage } = input;
  const text = customMessage?.trim().slice(0, 600);
  const custom = customMessage !== undefined;
  if (custom && !text) throw new Error("EMPTY_INQUIRY");
  const record = {
    customer: custom ? l("직접 입력 고객", "Sample customer")[locale] : scenario.customer[locale],
    channel: custom ? l("체험 입력", "Demo input")[locale] : scenario.channel[locale],
    owner: industry.owner[locale], industry: industry.name[locale],
    reference: custom ? "DEMO-CUSTOM" : `DEMO-${scenario.id.toUpperCase()}`,
  };
  const knowledge = getClinicSources(custom ? "" : scenario.id, locale);
  if (!custom) return {
    mode: "scenario", category: scenario.category[locale], intent: scenario.intent[locale],
    fields: scenario.fields.map(([label, value]) => ({ label: label[locale], value: value[locale] })),
    confirmation: knowledge.confirmation ?? scenario.confirmation[locale], record, reply: knowledge.reply ?? scenario.reply[locale],
    sources: knowledge.sources,
    tasks: scenario.tasks.map(title => ({ title: title[locale], owner: record.owner })),
  };

  // Conservative keyword matching. No guessed dates, prices, availability or
  // industry policies; unmatched text is routed for a person's review.
  const categories = [
    { pattern: /환불|교환|반품|refund|exchange|return/i, label: l("교환 · 환불 문의", "Exchange · Refund inquiry") },
    { pattern: /배송|출고|delivery|shipping|dispatch/i, label: l("배송 문의", "Delivery inquiry") },
    { pattern: /예약|방문|상담|체험|appointment|book|visit|trial/i, label: l("예약 · 상담 문의", "Booking · Consultation") },
    { pattern: /견적|비용|가격|예산|수강료|월세|quote|cost|price|budget|tuition|rent/i, label: l("비용 · 견적 문의", "Pricing · Estimate inquiry") },
  ];
  const category = (categories.find(item => item.pattern.test(text!))?.label ?? l("일반 문의 · 확인 필요", "General inquiry · Review needed"))[locale];
  const date = text!.match(/(?:(?:이번|다음)\s*주\s*)?(?:월|화|수|목|금|토|일)요일(?:\s*(?:오전|오후)(?:\s*\d{1,2}시)?)?|\d{1,2}월\s*\d{1,2}일|(?:this|next)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i)?.[0];
  const order = text!.match(/\bDEMO-\d{3,8}\b/i)?.[0];
  const fields = [{ label: l("입력한 문의", "Original inquiry")[locale], value: text! }];
  if (date) fields.push({ label: l("언급된 일정 · 확정 아님", "Mentioned time · Not confirmed")[locale], value: date });
  if (order) fields.push({ label: l("언급된 주문 번호", "Mentioned order number")[locale], value: order });
  return {
    mode: "custom", category,
    sources: [],
    intent: l("입력한 키워드로 임시 분류했습니다. 정확한 요청은 담당자가 확인해야 합니다.", "Provisionally classified by keywords. A staff member needs to confirm the request.")[locale],
    fields, record,
    confirmation: l("요청의 정확한 의미와 사업장의 실제 정보 확인", "The exact request and verified business information")[locale],
    reply: l("안녕하세요. 문의를 남겨주셔서 감사합니다. 전달해 주신 내용은 담당자의 확인이 필요합니다. 구체적인 요청과 관련 정보를 확인한 뒤 안내드리겠습니다. 예약 가능 여부, 비용 및 정책은 아직 확인되지 않았습니다.", "Hello, thank you for your inquiry. Your message requires staff review. The team will need to confirm the specific request and relevant information before advising you. Availability, pricing and policies have not been verified.")[locale],
    tasks: [l("입력한 문의 내용 검토", "Review the original inquiry"), l("필요한 정보를 확인한 뒤 답변 초안 검토", "Verify the required information and review the reply draft")]
      .map(title => ({ title: title[locale], owner: record.owner })),
  };
}

export const simulateInquiry: AutomationProcessor = async (input, signal) => {
  signal.throwIfAborted();
  return buildDemoResult(input);
};
