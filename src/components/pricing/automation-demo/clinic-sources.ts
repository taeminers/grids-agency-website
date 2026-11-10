import { l, type Locale } from "./scenarios";

export type DemoSource = {
  id: string;
  kind: "booking" | "file";
  name: string;
  action: string;
  reference: string;
  summary: string;
  rows: { label: string; value: string; state?: "available" | "unavailable" }[];
};

// Fictional business records, not market prices or a live NAVER integration.
// Both the source inspector and reply are derived from these same records.
export const clinicPriceSheet = {
  id: "clinic-prices-demo-v1",
  consultation: 30000,
  programs: [
    { name: l("흉터 관리 프로그램 A", "Scar care program A"), amount: 1000000 },
    { name: l("흉터 관리 프로그램 B", "Scar care program B"), amount: 1500000 },
    { name: l("흉터 관리 프로그램 C", "Scar care program C"), amount: 2000000 },
  ],
};
export const clinicBookingSlots = {
  saturday: [{ time: "14:00", available: false }, { time: "15:30", available: true }, { time: "16:30", available: true }],
  wednesday: [{ time: "14:00", available: false }, { time: "15:30", available: true }],
};

const money = (amount: number, locale: Locale) => locale === "ko" ? `${amount.toLocaleString("ko-KR")}원` : `KRW ${amount.toLocaleString("en-US")}`;

export function getClinicSources(scenarioId: string, locale: Locale): { sources: DemoSource[]; reply?: string; confirmation?: string } {
  if (scenarioId !== "clinic-scar" && scenarioId !== "clinic-change") return { sources: [] };
  const day = scenarioId === "clinic-scar" ? "saturday" : "wednesday";
  const dayLabel = day === "saturday" ? l("토요일", "Saturday")[locale] : l("수요일", "Wednesday")[locale];
  const slots = clinicBookingSlots[day];
  const available = slots.filter(slot => slot.available).map(slot => slot.time).join(", ");
  const unavailable = slots.filter(slot => !slot.available).map(slot => slot.time).join(", ");
  const availability = locale === "ko"
    ? `${unavailable ? `${unavailable}는 마감되었습니다. ` : ""}${available ? `${available}에 상담이 가능합니다.` : "현재 예약 가능한 시간이 없습니다."}`
    : `${unavailable ? `${unavailable} is unavailable. ` : ""}${available ? `${available} is available.` : "There are no available times."}`;
  const booking: DemoSource = {
    id: `naver-${day}-demo`, kind: "booking", name: l("네이버 예약", "NAVER Booking")[locale],
    action: l("예약 가능 시간 불러오기", "Look up available appointment times")[locale],
    reference: l(`예약 연동 예시 · ${dayLabel} 오후`, `Booking integration sample · ${dayLabel} afternoon`)[locale],
    summary: l(`예약 가능 시간 ${slots.filter(slot => slot.available).length}개 확인`, `${slots.filter(slot => slot.available).length} available times found`)[locale],
    rows: slots.map(slot => ({ label: `${dayLabel} ${slot.time}`, value: (slot.available ? l("예약 가능", "Available") : l("예약 마감", "Unavailable"))[locale], state: slot.available ? "available" : "unavailable" })),
  };
  if (scenarioId === "clinic-change") return {
    sources: [booking],
    reply: l(
      `안녕하세요, 지훈님. 예약 연동 예시에서 수요일 오후를 확인했습니다. ${availability}\n\n기존 월요일 예약을 변경하려면 예약 정보 확인이 필요합니다. 희망 시간을 알려주시면 담당자가 기존 예약을 확인한 뒤 변경을 검토할 수 있도록 전달하겠습니다. 아직 예약은 변경되지 않았습니다.`,
      `Hi Jihoon, we checked Wednesday afternoon in the sample booking records. ${availability}\n\nYour existing Monday booking still needs to be verified before it can be changed. Please share your preferred time so the team can review the request. No booking has been modified.`,
    )[locale],
    confirmation: l("기존 예약 정보와 고객의 변경 희망 시간 최종 확인", "Verify the existing reservation and confirm the customer’s preferred time")[locale],
  };
  const fee = money(clinicPriceSheet.consultation, locale);
  const priceLines = clinicPriceSheet.programs.map(program => `${program.name[locale]} · ${money(program.amount, locale)}`).join("\n");
  const prices: DemoSource = {
    id: clinicPriceSheet.id, kind: "file", name: l("상담·프로그램 비용표.xlsx", "Consultation & program fees.xlsx")[locale],
    action: l("내부 비용표에서 가격 확인", "Read the internal price sheet")[locale],
    reference: l("내부 문서 예시 · v1 · VAT 포함", "Sample internal file · v1 · VAT included")[locale],
    summary: l("상담료와 프로그램 가격 3건 확인", "Consultation fee and 3 program prices found")[locale],
    rows: [{ label: l("상담료", "Consultation fee")[locale], value: fee }, ...clinicPriceSheet.programs.map(program => ({ label: program.name[locale], value: money(program.amount, locale) }))],
  };
  return {
    sources: [prices, booking],
    reply: l(
      `안녕하세요, 민서님. 흉터 치료 비용과 토요일 상담 가능 시간을 문의해 주셨네요. 내부 비용표 예시에서 확인한 금액을 안내드립니다.\n\n${priceLines}\n상담료 · ${fee}\n(VAT 포함 · 모두 체험용 가상 금액)\n\n토요일 예약 연동 예시를 확인했습니다. ${availability} 원하시는 시간을 알려주시면 담당자가 확인할 수 있도록 전달하겠습니다.\n\n프로그램 선택과 실제 치료 비용은 상담 후 결정되며, 아직 예약은 확정되지 않았습니다.`,
      `Hi Minseo, you asked about scar treatment prices and Saturday consultation times. These amounts come from the sample internal price sheet.\n\n${priceLines}\nConsultation fee · ${fee}\n(VAT included · All amounts are fictional demo prices)\n\nWe checked Saturday’s sample booking records. ${availability} Please share your preferred time for the team to review.\n\nProgram selection and actual treatment costs require a consultation. No appointment has been confirmed.`,
    )[locale],
    confirmation: l("고객의 희망 시간, 프로그램 선택 및 실제 치료 범위", "The preferred time, program selection and actual treatment scope")[locale],
  };
}
