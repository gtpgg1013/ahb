const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 자연스러운 한국 이름들
const profiles = [
  { id: "user_ahb_001", display_name: "김민지", bio: "책 읽는 거 좋아해요" },
  { id: "user_ahb_002", display_name: "이준혁", bio: "스타트업에서 일하고 있어요" },
  { id: "user_ahb_003", display_name: "박서연", bio: "그냥 평범한 직장인" },
  { id: "user_ahb_004", display_name: "최현우", bio: "개발자입니다" },
  { id: "user_ahb_005", display_name: "정지은", bio: "글 쓰는 걸 좋아합니다" },
  { id: "user_ahb_006", display_name: "강태민", bio: "운동하고 책 읽어요" },
  { id: "user_ahb_007", display_name: "윤수아", bio: null },
  { id: "user_ahb_008", display_name: "한도윤", bio: "음악 들으면서 일해요" },
  { id: "user_ahb_009", display_name: "조은서", bio: "마케터예요" },
  { id: "user_ahb_010", display_name: "신재원", bio: null },
];

// 실제 인물들의 명언 + 자연스러운 개인 감상
const inspirations = [
  // 스티브 잡스
  {
    user_id: "user_ahb_001",
    content: "스티브 잡스가 했던 말 중에 이게 제일 와닿았어요. \"매일 아침 거울을 보며 '오늘이 내 인생의 마지막 날이라면 오늘 하려는 일을 하고 싶은가?'라고 스스로에게 물어왔다.\" 요즘 회사 다니면서 이 질문 자주 해보게 돼요.",
    context: "퇴사 고민하다가",
    tags: ["스티브잡스", "인생", "선택"],
    is_public: true,
  },
  {
    user_id: "user_ahb_004",
    content: "\"Stay hungry, stay foolish.\" - 스티브 잡스. 스탠포드 연설 다시 봤는데, 10년 전에 봤을 때랑 느낌이 다르네요. 그때는 그냥 멋있는 말 같았는데, 지금은 진짜 그렇게 살아야겠다는 생각이 들어요.",
    context: "퇴근 후 유튜브 보다가",
    tags: ["스티브잡스", "동기부여"],
    is_public: true,
  },

  // 일론 머스크
  {
    user_id: "user_ahb_002",
    content: "일론 머스크: \"회사를 창업하는 것은 유리를 씹고 깊은 절망을 응시하는 것과 같다.\" ㅋㅋㅋ 창업 6개월차인데 진짜 공감됨... 근데 그래도 계속하게 되는 게 신기해요.",
    context: "새벽 3시 야근 중",
    tags: ["창업", "스타트업", "일론머스크"],
    is_public: true,
  },

  // 워렌 버핏
  {
    user_id: "user_ahb_009",
    content: "워렌 버핏: \"남들이 탐욕스러울 때 두려워하고, 남들이 두려워할 때 탐욕스러워라.\" 주식 시작하면서 이 말 되게 많이 들었는데, 실제로 실천하기는 어렵더라고요.",
    context: "주식 공부하면서",
    tags: ["워렌버핏", "투자", "주식"],
    is_public: true,
  },
  {
    user_id: "user_ahb_003",
    content: "\"가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다.\" - 워렌 버핏. 싼 거 사다가 결국 비싼 거 다시 사는 경우가 많아서... 이제는 가치 보고 사려고요.",
    context: null,
    tags: ["워렌버핏", "가치", "소비"],
    is_public: true,
  },

  // 마크 트웨인
  {
    user_id: "user_ahb_005",
    content: "마크 트웨인: \"인생에서 가장 중요한 두 날은 당신이 태어난 날과 그 이유를 발견한 날이다.\" 아직 두 번째 날은 못 찾은 것 같은데... 언젠간 오겠죠?",
    context: "30대 되고 나서",
    tags: ["마크트웨인", "인생", "목적"],
    is_public: true,
  },
  {
    user_id: "user_ahb_010",
    content: "\"20년 뒤에 당신은 했던 일보다 하지 않았던 일 때문에 더 실망할 것이다.\" - 마크 트웨인. 이거 보고 미루던 여행 예약했어요.",
    context: "휴가 계획 세우면서",
    tags: ["마크트웨인", "후회", "도전"],
    is_public: true,
  },

  // 알버트 아인슈타인
  {
    user_id: "user_ahb_004",
    content: "아인슈타인: \"미친 짓이란 같은 행동을 반복하면서 다른 결과를 기대하는 것이다.\" 개발하다 보면 같은 코드 계속 돌리면서 왜 안 되지? 하는 경우 많은데 ㅋㅋ 이 말 생각하게 됨.",
    context: "버그 잡다가",
    tags: ["아인슈타인", "개발", "문제해결"],
    is_public: true,
  },
  {
    user_id: "user_ahb_007",
    content: "\"상상력은 지식보다 중요하다. 지식은 한계가 있지만 상상력은 세상 모든 것을 끌어안는다.\" - 아인슈타인. 공부만 하던 시절엔 이해 못했는데 지금은 알 것 같아요.",
    context: null,
    tags: ["아인슈타인", "상상력", "창의성"],
    is_public: true,
  },

  // 넬슨 만델라
  {
    user_id: "user_ahb_006",
    content: "넬슨 만델라: \"인생에서 가장 큰 영광은 넘어지지 않는 것에 있는 것이 아니라 매번 일어선다는 데 있다.\" 운동하다 부상 당했을 때 이 말 많이 생각했어요.",
    context: "재활 중에",
    tags: ["넬슨만델라", "회복", "도전"],
    is_public: true,
  },

  // 마하트마 간디
  {
    user_id: "user_ahb_001",
    content: "간디: \"세상에서 보고 싶은 변화가 있다면 스스로 그 변화가 되어라.\" 남 탓만 하다가 이 말 보고 반성했어요. 바뀌길 바라면 내가 먼저 바뀌어야 하는 거더라고요.",
    context: "인간관계 고민하다가",
    tags: ["간디", "변화", "자기계발"],
    is_public: true,
  },

  // 오프라 윈프리
  {
    user_id: "user_ahb_009",
    content: "오프라 윈프리: \"실패는 성공으로 가는 길에 있는 이정표일 뿐이다.\" 프로젝트 실패하고 많이 힘들었는데, 지금 보면 그때 배운 게 더 많았던 것 같아요.",
    context: "이직 후",
    tags: ["오프라윈프리", "실패", "성장"],
    is_public: true,
  },

  // 유재석
  {
    user_id: "user_ahb_005",
    content: "유재석: \"잘하려고 하지 말고, 끝까지 하려고 노력해라.\" 글 쓸 때 이 말 많이 떠올려요. 완벽한 글 쓰려다 보면 한 줄도 못 쓰거든요.",
    context: "글 마감 앞두고",
    tags: ["유재석", "글쓰기", "꾸준함"],
    is_public: true,
  },
  {
    user_id: "user_ahb_007",
    content: "\"열 가지 중 한 가지는 안 좋을 수 있다. 아홉 가지 좋은 걸 생각하면서 행복하게 살면 된다.\" - 유재석. 요즘 자꾸 안 좋은 것만 생각나서 이거 메모해뒀어요.",
    context: null,
    tags: ["긍정", "유재석", "행복"],
    is_public: true,
  },

  // BTS RM
  {
    user_id: "user_ahb_001",
    content: "RM 유엔 연설: \"저 자신을 온 힘을 다해 끌어안고 천천히, 그저 조금씩 사랑하려 합니다.\" 자기 자신을 사랑하는 게 제일 어려운 것 같아요. 근데 그게 시작이래요.",
    context: "자존감 바닥일 때",
    tags: ["RM", "자기사랑", "BTS"],
    is_public: true,
  },

  // 손흥민
  {
    user_id: "user_ahb_006",
    content: "손흥민: \"제 인생에서 공짜로 얻은 건 하나도 없었어요. 전부 죽어라 노력해서 얻은 결과물이라고 믿어요.\" 재능 타령하는 사람들 많은데, 결국 노력이 답인 것 같아요.",
    context: "운동 쉬고 싶을 때",
    tags: ["손흥민", "노력", "축구"],
    is_public: true,
  },
  {
    user_id: "user_ahb_002",
    content: "\"인생에서 후불은 없다.\" - 손흥민. 짧은데 임팩트 있음. 지금 열심히 안 하면 나중에 대가 치른다는 뜻인 듯.",
    context: null,
    tags: ["손흥민", "명언"],
    is_public: true,
  },

  // 박지성
  {
    user_id: "user_ahb_003",
    content: "박지성: \"남들이 당연하다고 여기는 순간에도 최선을 다해 보세요.\" 회사에서 대충대충 하고 싶을 때 이 말 생각나요.",
    context: "월요일 아침",
    tags: ["박지성", "노력", "직장인"],
    is_public: true,
  },

  // 니체
  {
    user_id: "user_ahb_004",
    content: "니체: \"괴물과 싸우는 자는 자신도 괴물이 되지 않도록 조심해야 한다. 심연을 오래 들여다보면 심연도 너를 들여다본다.\" 레거시 코드 리팩토링하다가 갑자기 이 말이 생각남 ㅋㅋ",
    context: "코드 리뷰하다가",
    tags: ["니체", "철학", "개발자"],
    is_public: true,
  },
  {
    user_id: "user_ahb_005",
    content: "\"나를 죽이지 못하는 것은 나를 더 강하게 만든다.\" - 니체. 진부한 말 같지만 힘들 때 진짜 도움 됨.",
    context: "힘든 시기 지나고",
    tags: ["니체", "성장", "회복"],
    is_public: true,
  },

  // 윈스턴 처칠
  {
    user_id: "user_ahb_010",
    content: "처칠: \"성공이란 실패에서 실패로 옮겨가면서도 열정을 잃지 않는 것이다.\" 취준 3년차인데... 이 말 보고 조금 힘이 났어요.",
    context: "면접 떨어지고",
    tags: ["처칠", "성공", "열정"],
    is_public: true,
  },
  {
    user_id: "user_ahb_008",
    content: "\"완벽주의자는 완벽한 기회를 기다리다 아무것도 하지 못한다.\" - 윈스턴 처칠. 사이드 프로젝트 시작 못하는 이유가 이거였음...",
    context: null,
    tags: ["처칠", "완벽주의", "실행"],
    is_public: true,
  },

  // 헨리 포드
  {
    user_id: "user_ahb_002",
    content: "헨리 포드: \"할 수 있다고 생각하든, 할 수 없다고 생각하든, 당신 생각이 맞다.\" 창업하면서 제일 많이 느끼는 것. 결국 마인드셋이 다 결정함.",
    context: "투자 유치 실패 후",
    tags: ["헨리포드", "마인드셋", "창업"],
    is_public: true,
  },

  // 빈센트 반 고흐
  {
    user_id: "user_ahb_005",
    content: "반 고흐: \"위대한 일은 작은 일들이 모여서 이루어진다.\" 매일 글 500자씩 쓴다고 대단한 거 아닌 것 같았는데, 1년 지나니까 책 한 권 분량이 됐어요.",
    context: "매일 글쓰기 1년차",
    tags: ["반고흐", "꾸준함", "글쓰기"],
    is_public: true,
  },

  // 파블로 피카소
  {
    user_id: "user_ahb_009",
    content: "피카소: \"영감은 존재한다. 하지만 일을 하고 있는 사람에게만 찾아온다.\" 기다리지 말고 일단 하라는 뜻인 듯. 기획서 쓰다가 갑자기 아이디어 터진 적 많아요.",
    context: "야근하다가",
    tags: ["피카소", "영감", "실행"],
    is_public: true,
  },

  // 개인 경험/깨달음
  {
    user_id: "user_ahb_007",
    content: "어디서 본 건데, \"충분한 수면이 최고의 자기계발\"이래요. 6시간 자다가 8시간으로 바꿨더니 진짜 다른 사람 된 느낌. 우울한 것도 줄었어요.",
    context: "수면 패턴 바꾸고 나서",
    tags: ["수면", "건강", "자기관리"],
    is_public: true,
  },
  {
    user_id: "user_ahb_008",
    content: "레딧에서 봤는데, \"초대받은 모든 논쟁에 참석할 필요는 없다\"래요. SNS에서 누가 틀린 말 해도 내가 바로잡을 의무 없음. 이거 깨닫고 마음이 편해졌어요.",
    context: "트위터 끊고 나서",
    tags: ["SNS", "마음관리", "논쟁"],
    is_public: true,
  },
  {
    user_id: "user_ahb_003",
    content: "\"그냥 나타나라. 나타나는 것만으로도 대부분의 사람들보다 앞서는 것이다.\" 누가 한 말인지 모르겠는데 진짜임. 헬스장 3년 등록만 하다가 올해는 일단 가기만 했더니 습관 됐어요.",
    context: "헬스장 6개월 개근 후",
    tags: ["습관", "운동", "꾸준함"],
    is_public: true,
  },
  {
    user_id: "user_ahb_001",
    content: "오늘 할머니랑 통화했는데, \"걱정은 내일의 슬픔을 없애주지 않고, 오늘의 기쁨만 빼앗아간다\"고 하시더라. 할머니 말씀이 제일 와닿아요.",
    context: "걱정 많은 날",
    tags: ["할머니", "걱정", "지혜"],
    is_public: true,
  },
  {
    user_id: "user_ahb_010",
    content: "친구가 해준 말: \"비교는 기쁨을 훔치는 도둑이다.\" 인스타 보면서 자꾸 남이랑 비교하게 되는데, 그럴 때마다 이 말 떠올려요.",
    context: null,
    tags: ["비교", "SNS", "행복"],
    is_public: true,
  },
  {
    user_id: "user_ahb_006",
    content: "마라톤 완주하고 나서 드는 생각: 결국 다 마음 싸움이더라. 몸은 생각보다 더 갈 수 있는데 머리가 먼저 포기하려고 함.",
    context: "첫 풀코스 완주 후",
    tags: ["마라톤", "도전", "마음"],
    is_public: true,
  },
];

async function seed() {
  console.log("기존 데이터 삭제 중...");

  // 기존 데이터 삭제
  await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("bookmarks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("resonates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("inspirations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("프로필 추가 중...");
  const { error: profileError } = await supabase.from("profiles").upsert(profiles);
  if (profileError) {
    console.error("프로필 에러:", profileError);
    return;
  }
  console.log(`${profiles.length}명 추가됨`);

  console.log("영감 추가 중...");
  const { error: inspirationError } = await supabase.from("inspirations").insert(inspirations);
  if (inspirationError) {
    console.error("영감 에러:", inspirationError);
    return;
  }
  console.log(`${inspirations.length}개 추가됨`);

  // 랜덤으로 공감 추가
  console.log("공감 추가 중...");
  const { data: allInspirations } = await supabase.from("inspirations").select("id, user_id");

  const resonates = [];
  for (const insp of allInspirations || []) {
    // 랜덤하게 1~4명이 공감
    const numResonates = Math.floor(Math.random() * 4) + 1;
    const otherUsers = profiles.filter(p => p.id !== insp.user_id);
    const shuffled = otherUsers.sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(numResonates, shuffled.length); i++) {
      resonates.push({
        user_id: shuffled[i].id,
        inspiration_id: insp.id,
      });
    }
  }

  if (resonates.length > 0) {
    await supabase.from("resonates").insert(resonates);
    console.log(`${resonates.length}개 공감 추가됨`);
  }

  console.log("완료!");
}

seed();
