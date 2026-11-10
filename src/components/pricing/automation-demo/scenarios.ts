export type Locale = "ko" | "en";
export type Localized = Record<Locale, string>;
export const l = (ko: string, en: string): Localized => ({ ko, en });
export type Scenario = {
  id: string;
  title: Localized;
  customer: Localized;
  channel: Localized;
  message: Localized;
  category: Localized;
  intent: Localized;
  fields: [Localized, Localized][];
  confirmation: Localized;
  reply: Localized;
  tasks: Localized[];
};
export type Industry = { id: string; name: Localized; owner: Localized; scenarios: Scenario[] };
const kakao = l("카카오톡", "KakaoTalk");
const website = l("웹사이트 문의", "Website inquiry");

export const industries: Industry[] = [
  {
    id: "clinic", name: l("피부과 / 병원", "Clinic"), owner: l("예약 담당자", "Appointments team"), scenarios: [
      {
        id: "clinic-scar", title: l("흉터 치료 가격 · 상담 예약", "Scar treatment pricing · Booking"), customer: l("김민서", "Minseo Kim"), channel: kakao,
        message: l("흉터 치료 가격이 궁금합니다. 프로그램별 금액과 상담 비용을 알려주실 수 있나요? 처음 방문하는데 이번 주 토요일 오후에 상담도 가능할까요?", "I’d like to know the prices for scar treatment programs and the consultation fee. It would be my first visit. Could I also have a consultation this Saturday afternoon?"),
        category: l("흉터 치료 비용 · 상담 예약", "Scar care pricing · Booking"), intent: l("프로그램 가격과 상담료, 토요일 예약 가능 시간 확인", "Check program prices, consultation fees and Saturday times"),
        fields: [[l("상담 내용", "Service"), l("흉터 치료 상담", "Scar treatment consultation")], [l("희망 일정", "Preferred time"), l("이번 주 토요일 오후", "This Saturday afternoon")], [l("방문 이력", "Visit history"), l("첫 방문", "First visit")]],
        confirmation: l("해당 시간 예약 가능 여부와 상담 비용", "Availability and the consultation fee"),
        reply: l("안녕하세요, 민서님. 첫 방문 피부 상담 문의 감사합니다. 이번 주 토요일 오후 예약 가능 여부와 상담 비용은 예약 담당자의 확인이 필요합니다. 원하시는 시간을 조금 더 구체적으로 알려주시면 함께 확인할 수 있도록 전달하겠습니다.", "Hi Minseo, thank you for your first-visit consultation inquiry. Our appointments team needs to confirm availability this Saturday afternoon and the consultation fee. Could you share a more specific preferred time so we can include it in the request?"),
        tasks: [l("조회한 시간 중 고객의 희망 시간 확인", "Confirm the customer’s preferred available time"), l("비용표 기반 답변 검토 후 상담 요청 준비", "Review the sourced reply and prepare a consultation request")],
      },
      {
        id: "clinic-change", title: l("예약 변경", "Reschedule a visit"), customer: l("박지훈", "Jihoon Park"), channel: website,
        message: l("다음 주 월요일 오전에 잡은 상담을 수요일 오후로 옮길 수 있을까요? 예약 번호는 아직 못 찾았어요.", "Could I move my consultation from next Monday morning to Wednesday afternoon? I haven’t found my booking number yet."),
        category: l("예약 변경", "Rescheduling"), intent: l("기존 상담 일정을 다른 시간으로 변경", "Move an existing consultation"),
        fields: [[l("기존 일정", "Current time"), l("다음 주 월요일 오전", "Next Monday morning")], [l("희망 일정", "Requested time"), l("다음 주 수요일 오후", "Next Wednesday afternoon")], [l("예약 번호", "Booking number"), l("미제공", "Not provided")]],
        confirmation: l("기존 예약 조회와 변경 가능 시간", "Existing booking and rescheduling availability"),
        reply: l("안녕하세요, 지훈님. 월요일 오전 상담을 수요일 오후로 변경하고 싶으시군요. 아직 예약이 변경된 것은 아니며, 기존 예약과 가능한 시간을 확인해야 합니다. 예약 시 사용한 성함과 연락처를 담당자에게 알려주시면 확인을 도와드리겠습니다.", "Hi Jihoon, you’d like to move Monday morning’s consultation to Wednesday afternoon. No booking has been changed yet; the existing reservation and available times need to be checked. Please provide the booking name and contact details to the appointments team."),
        tasks: [l("고객에게 기존 예약 정보 확인", "Request existing booking details"), l("조회한 수요일 시간으로 변경 요청 준비", "Prepare a change request for the available Wednesday time")],
      },
    ],
  },
  {
    id: "interior", name: l("인테리어 업체", "Interior design"), owner: l("견적 담당자", "Project estimates team"), scenarios: [
      {
        id: "interior-quote", title: l("리모델링 견적", "Renovation estimate"), customer: l("이수진", "Sujin Lee"), channel: website,
        message: l("마포구 24평 아파트 주방과 욕실을 리모델링하고 싶어요. 예산은 2천만 원 정도이고, 3월 입주 전에 끝낼 수 있을까요?", "I’d like to renovate the kitchen and bathroom of a 24-pyeong apartment in Mapo. My budget is around KRW 20 million. Could it be finished before I move in during March?"),
        category: l("리모델링 견적", "Renovation estimate"), intent: l("부분 공사 비용과 진행 가능 일정 확인", "Check scope, cost and feasibility"),
        fields: [[l("위치 · 면적", "Location · Size"), l("마포구 · 24평", "Mapo · 24 pyeong")], [l("공사 범위", "Scope"), l("주방 · 욕실", "Kitchen · Bathroom")], [l("고객 예산", "Customer budget"), l("약 2,000만 원", "Approx. KRW 20 million")], [l("희망 시점", "Target"), l("3월 입주 전 · 연도 확인 필요", "Before March move-in · Year unconfirmed")]],
        confirmation: l("현장 상태, 상세 공사 범위와 입주일", "Site condition, detailed scope and move-in date"),
        reply: l("안녕하세요, 수진님. 마포구 24평 아파트의 주방·욕실 리모델링 문의를 확인했습니다. 말씀해 주신 예산과 희망 시점을 기준으로 검토하되, 정확한 견적과 일정은 현장 상태 확인 후 안내할 수 있습니다. 도면이나 현장 사진, 정확한 입주 예정일을 보내주실 수 있을까요?", "Hi Sujin, we’ve noted your Mapo apartment’s kitchen and bathroom renovation, budget and target date. A quote and schedule require a review of the property and scope. Could you share a floor plan or photos and your exact move-in date?"),
        tasks: [l("도면 · 사진 및 입주 예정일 요청", "Request plans, photos and the move-in date"), l("공사 범위 검토 후 견적 상담 준비", "Review scope and prepare an estimate consultation")],
      },
      {
        id: "interior-visit", title: l("현장 상담", "Site consultation"), customer: l("최현우", "Hyunwoo Choi"), channel: kakao,
        message: l("성수동에서 15평 카페를 준비 중입니다. 이번 주 금요일 오후에 현장 상담이 가능할까요? 아직 도면은 없습니다.", "I’m opening a 15-pyeong cafe in Seongsu. Is a site consultation possible this Friday afternoon? I don’t have floor plans yet."),
        category: l("현장 상담 요청", "Site consultation"), intent: l("상가 공사 전 현장 상담 일정 확인", "Arrange a pre-renovation site consultation"),
        fields: [[l("공간", "Property"), l("성수동 · 15평 카페", "Seongsu · 15-pyeong cafe")], [l("희망 일정", "Preferred time"), l("이번 주 금요일 오후", "This Friday afternoon")], [l("도면", "Plans"), l("없음", "Not available")]],
        confirmation: l("정확한 주소와 담당자 방문 가능 일정", "Exact address and team availability"),
        reply: l("안녕하세요, 현우님. 성수동 카페 현장 상담 문의 감사합니다. 금요일 오후 방문 가능 여부는 담당자 일정 확인이 필요합니다. 정확한 주소와 원하시는 시간을 알려주시면 전달하겠습니다. 도면이 없으시면 현장 사진도 검토에 도움이 됩니다.", "Hi Hyunwoo, thank you for your cafe consultation inquiry. Friday afternoon availability needs to be checked with the team. Please share the exact address and preferred time. Photos would help with the review if plans aren’t available."),
        tasks: [l("현장 주소와 사진 확인", "Collect the site address and photos"), l("금요일 방문 가능 여부 확인", "Check Friday site-visit availability")],
      },
    ],
  },
  {
    id: "academy", name: l("학원", "Academy"), owner: l("교육 상담팀", "Admissions team"), scenarios: [
      {
        id: "academy-trial", title: l("체험 수업", "Trial class"), customer: l("정유나", "Yuna Jung"), channel: kakao,
        message: l("초등학교 3학년 아이 영어 수업을 알아보고 있어요. 화요일이나 목요일 4시 이후에 체험 수업을 받을 수 있나요? 수강료도 궁금합니다.", "I’m looking for English classes for my third-grade child. Is a trial possible after 4 pm on Tuesday or Thursday? I’d also like to know the tuition."),
        category: l("체험 수업 · 수강료", "Trial class · Tuition"), intent: l("학년에 맞는 영어 체험 수업과 수강료 확인", "Find an appropriate trial class and tuition"),
        fields: [[l("학생", "Student"), l("초등학교 3학년", "Grade 3")], [l("과목", "Subject"), l("영어", "English")], [l("희망 일정", "Preferred time"), l("화 · 목 오후 4시 이후", "Tue / Thu after 4 pm")]],
        confirmation: l("수준별 반, 체험 가능 시간과 수강료", "Class level, trial availability and tuition"),
        reply: l("안녕하세요, 유나님. 초등 3학년 영어 수업 문의 감사합니다. 화요일 또는 목요일 오후 4시 이후 체험 가능 여부와 수강료는 교육 상담팀이 확인해 드려야 합니다. 아이의 현재 영어 학습 경험을 알려주시면 적절한 반을 함께 검토할 수 있습니다.", "Hi Yuna, thanks for asking about Grade 3 English classes. Our admissions team needs to confirm trial availability after 4 pm on Tuesday or Thursday and the tuition. Could you tell us about your child’s English learning experience so the team can review suitable classes?"),
        tasks: [l("학생의 영어 학습 경험 확인", "Ask about the student’s learning experience"), l("체험 수업 시간과 수강료 확인", "Check trial times and tuition")],
      },
      {
        id: "academy-course", title: l("수업 과정", "Course inquiry"), customer: l("강도윤", "Doyun Kang"), channel: website,
        message: l("중학교 2학년 수학 내신 대비반을 찾고 있어요. 주말 수업이 있는지, 반 배정 전에 테스트를 보는지 알려주세요.", "I’m looking for a Grade 8 math course focused on school exams. Are there weekend classes, and is a placement test required?"),
        category: l("수업 과정 안내", "Course information"), intent: l("내신 대비반 운영과 반 배정 절차 확인", "Check exam-prep classes and placement steps"),
        fields: [[l("학생", "Student"), l("중학교 2학년", "Grade 8")], [l("과목 · 목표", "Subject · Goal"), l("수학 · 내신 대비", "Math · School exams")], [l("희망 일정", "Preferred time"), l("주말", "Weekends")]],
        confirmation: l("주말반 운영 여부와 반 배정 기준", "Weekend classes and placement requirements"),
        reply: l("안녕하세요, 도윤님. 중2 수학 내신 대비반 문의를 접수했습니다. 주말반 운영과 테스트 여부는 학원의 현재 과정 기준을 확인해야 합니다. 재학 중인 학교와 현재 진도를 알려주시면 상담팀이 확인할 때 참고하겠습니다.", "Hi Doyun, we’ve noted your Grade 8 math inquiry. Weekend classes and placement-test requirements need to be checked against the academy’s current courses. Please share the student’s school and current progress for the admissions team’s review."),
        tasks: [l("학교와 현재 진도 확인", "Confirm school and current progress"), l("주말반 · 반 배정 절차 확인", "Check weekend courses and placement steps")],
      },
    ],
  },
  {
    id: "shop", name: l("쇼핑몰", "Online store"), owner: l("고객 지원팀", "Customer support"), scenarios: [
      {
        id: "shop-delivery", title: l("배송 확인", "Delivery status"), customer: l("한서연", "Seoyeon Han"), channel: kakao,
        message: l("주문번호 DEMO-2048입니다. 어제 주문한 운동화가 아직 배송 준비 중인데, 이번 주 금요일까지 받을 수 있을까요?", "My order number is DEMO-2048. The sneakers I ordered yesterday still say ‘preparing for shipment.’ Can they arrive by this Friday?"),
        category: l("배송 일정 문의", "Delivery inquiry"), intent: l("주문 출고 상태와 희망일 도착 가능 여부 확인", "Check dispatch status and delivery feasibility"),
        fields: [[l("주문 번호", "Order number"), l("DEMO-2048", "DEMO-2048")], [l("상품", "Product"), l("운동화", "Sneakers")], [l("고객이 확인한 상태", "Customer-reported status"), l("배송 준비 중", "Preparing for shipment")], [l("희망 수령일", "Requested delivery"), l("이번 주 금요일까지", "By this Friday")]],
        confirmation: l("실제 출고 상태와 배송 예상 일정", "Actual dispatch status and delivery estimate"),
        reply: l("안녕하세요, 서연님. DEMO-2048 주문의 배송 문의를 확인했습니다. 현재 시스템의 출고 상태와 배송 일정을 조회해야 하므로 금요일 도착을 확답드리기는 어렵습니다. 담당자가 주문 정보를 확인한 뒤 안내할 수 있도록 요청을 정리하겠습니다.", "Hi Seoyeon, we’ve noted your delivery inquiry for DEMO-2048. The actual dispatch status and shipping estimate need to be checked, so we can’t promise Friday delivery. We’ll prepare the inquiry for a member of the team to review the order details."),
        tasks: [l("DEMO-2048 출고 상태 조회", "Look up dispatch status for DEMO-2048"), l("확인된 배송 예상 일정 안내 준비", "Prepare a reply using the verified delivery estimate")],
      },
      {
        id: "shop-return", title: l("교환 요청", "Exchange request"), customer: l("윤태호", "Taeho Yoon"), channel: website,
        message: l("오늘 받은 셔츠가 작아서 M에서 L로 교환하고 싶어요. 주문번호는 DEMO-3091이고 택은 그대로 붙어 있습니다. 배송비가 있나요?", "The shirt I received today is too small. I’d like to exchange M for L. My order is DEMO-3091, and the tag is still attached. Is there a shipping charge?"),
        category: l("사이즈 교환", "Size exchange"), intent: l("교환 가능 여부와 배송비 확인", "Check exchange eligibility and shipping fees"),
        fields: [[l("주문 번호", "Order number"), l("DEMO-3091", "DEMO-3091")], [l("교환 요청", "Requested change"), l("셔츠 M → L", "Shirt M → L")], [l("상품 상태", "Reported condition"), l("오늘 수령 · 택 부착", "Received today · Tag attached")]],
        confirmation: l("L 재고, 교환 정책과 배송비", "L stock, exchange policy and shipping fees"),
        reply: l("안녕하세요, 태호님. DEMO-3091 셔츠를 M에서 L로 교환하고 싶으시군요. 교환 가능 여부와 배송비는 상품 재고 및 교환 정책 확인 후 안내해야 합니다. 아직 교환이 접수되거나 확정된 것은 아니며, 담당자가 확인할 수 있도록 요청을 준비하겠습니다.", "Hi Taeho, you’d like to exchange the shirt in order DEMO-3091 from M to L. Eligibility and shipping fees depend on stock and the exchange policy. An exchange hasn’t been submitted or confirmed; we’ll prepare the request for staff review."),
        tasks: [l("L 사이즈 재고와 교환 조건 확인", "Check L stock and exchange conditions"), l("교환 배송비 확인 후 안내 준비", "Verify exchange shipping fees for the reply")],
      },
    ],
  },
  {
    id: "property", name: l("부동산", "Real estate"), owner: l("매물 상담 담당자", "Property team"), scenarios: [
      {
        id: "property-visit", title: l("매물 방문", "Property viewing"), customer: l("오지민", "Jimin Oh"), channel: kakao,
        message: l("연남동 투룸 매물 보고 연락드려요. 보증금 1천만 원에 월세 80만 원으로 적혀 있던데, 반려묘와 입주 가능한가요? 토요일에 보고 싶어요.", "I’m asking about the two-bedroom listing in Yeonnam. It showed a KRW 10 million deposit and KRW 800,000 monthly rent. Are cats allowed? I’d like to view it on Saturday."),
        category: l("매물 방문 · 조건 문의", "Viewing · Property conditions"), intent: l("반려동물 가능 여부와 방문 일정 확인", "Check pet permission and viewing availability"),
        fields: [[l("매물", "Property"), l("연남동 투룸 · 매물 번호 미제공", "Yeonnam two-bedroom · Listing ID not provided")], [l("고객이 본 금액", "Customer-reported price"), l("보증금 1,000만 원 / 월세 80만 원", "Deposit KRW 10m / Monthly KRW 800k")], [l("추가 조건", "Requirement"), l("반려묘 동반", "Cat-friendly")], [l("희망 일정", "Preferred time"), l("토요일", "Saturday")]],
        confirmation: l("매물 정보, 반려동물 조건과 방문 가능 시간", "Listing details, pet policy and viewing times"),
        reply: l("안녕하세요, 지민님. 연남동 투룸 방문 문의 감사합니다. 안내받으신 금액과 반려묘 동반 가능 여부는 해당 매물의 현재 조건을 확인해야 합니다. 매물 링크와 토요일 희망 시간을 보내주시면 담당자가 확인할 수 있도록 정리하겠습니다.", "Hi Jimin, thanks for asking about the Yeonnam property. The quoted price and permission to keep a cat need to be checked against the listing’s current terms. Please share the listing link and your preferred Saturday time for the property team to review."),
        tasks: [l("매물 링크와 현재 조건 확인", "Verify the listing and current terms"), l("반려묘 조건 · 토요일 방문 가능 여부 확인", "Check pet permission and Saturday availability")],
      },
      {
        id: "property-search", title: l("맞춤 매물 요청", "Property search"), customer: l("임하린", "Harin Lim"), channel: website,
        message: l("강남역 도보 10분 이내 사무실을 찾고 있어요. 직원 6명이 쓰고, 월세 예산은 200만 원 이하입니다. 다음 달 입주를 원합니다.", "I’m looking for an office within a 10-minute walk of Gangnam Station for six staff. My monthly rent budget is under KRW 2 million, and I’d like to move in next month."),
        category: l("사무실 매물 요청", "Office search"), intent: l("조건에 맞는 사무실 후보 확인", "Find office options matching the requirements"),
        fields: [[l("지역", "Area"), l("강남역 도보 10분 이내", "Within 10 minutes’ walk of Gangnam Station")], [l("사용 인원", "Team size"), l("6명", "6 people")], [l("고객 예산", "Customer budget"), l("월세 200만 원 이하", "Monthly rent under KRW 2 million")], [l("희망 입주", "Move-in"), l("다음 달", "Next month")]],
        confirmation: l("보증금 예산, 면적과 현재 이용 가능한 매물", "Deposit budget, floor area and available listings"),
        reply: l("안녕하세요, 하린님. 강남역 인근 6인 사무실 조건을 확인했습니다. 월세 예산과 입주 시점을 참고해 검토할 수 있도록, 보증금 예산과 필요한 면적도 알려주실 수 있을까요? 실제 추천 매물과 입주 가능일은 담당자 확인 후 안내가 필요합니다.", "Hi Harin, we’ve noted your requirements for a six-person office near Gangnam Station. Could you also share your deposit budget and preferred floor area? Available properties and move-in dates will need to be confirmed by the property team."),
        tasks: [l("보증금 예산과 희망 면적 확인", "Confirm deposit budget and floor area"), l("조건에 맞는 매물 후보 검토 요청", "Prepare a request to review matching listings")],
      },
    ],
  },
];
