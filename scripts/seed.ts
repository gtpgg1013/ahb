import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅" : "❌");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 사용자 데이터
const users = [
  { email: "kim.young@example.com", password: "Test1234!", displayName: "김영감", bio: "일상에서 영감을 찾는 UX 디자이너. 사소한 것에서 큰 아이디어를 발견합니다." },
  { email: "lee.chang@example.com", password: "Test1234!", displayName: "이창작", bio: "코드로 세상을 바꾸는 개발자. 기술과 인문학의 교차점을 탐구합니다." },
  { email: "park.insight@example.com", password: "Test1234!", displayName: "박인사이트", bio: "스타트업 창업가. 실패에서 배운 교훈을 나눕니다." },
  { email: "choi.muse@example.com", password: "Test1234!", displayName: "최뮤즈", bio: "작가 지망생. 삶의 순간들을 글로 담아냅니다." },
  { email: "jung.think@example.com", password: "Test1234!", displayName: "정생각", bio: "철학을 전공한 마케터. 브랜드와 사람의 연결고리를 고민합니다." },
];

// 영감 데이터
const inspirations = [
  {
    userIndex: 0,
    content: "좋은 디자인은 보이지 않는 것이다. 사용자가 인터페이스를 의식하지 않고 목표에 집중할 수 있을 때, 그것이 진정한 성공이다.",
    context: "신입 디자이너 멘토링 중 떠오른 생각",
    tags: ["디자인", "UX", "철학"],
    isPublic: true,
  },
  {
    userIndex: 0,
    content: "카페에서 할머니가 키오스크 앞에서 당황하시는 모습을 봤다. 기술의 발전이 누군가에게는 장벽이 될 수 있다는 걸 다시 깨달았다.",
    context: "동네 카페에서",
    tags: ["접근성", "기술", "사회"],
    isPublic: true,
  },
  {
    userIndex: 1,
    content: "코드는 시와 같다. 불필요한 것을 덜어내고, 핵심만 남겼을 때 비로소 아름다워진다. 리팩토링은 편집과 같은 과정이다.",
    context: "새벽 3시 코딩하다가",
    tags: ["개발", "철학", "창작"],
    isPublic: true,
  },
  {
    userIndex: 1,
    content: "AI가 코드를 대신 짜주는 시대. 개발자의 가치는 '무엇을 만들 것인가'를 결정하는 능력에 있다. 도구가 아닌 방향을 제시하는 사람이 되자.",
    context: "Claude와 페어 프로그래밍하면서",
    tags: ["AI", "개발", "미래"],
    isPublic: true,
  },
  {
    userIndex: 2,
    content: "첫 번째 스타트업이 망했을 때, 세상이 끝난 줄 알았다. 하지만 그 실패가 없었다면 지금의 성공도 없었을 것이다. 실패는 끝이 아니라 데이터다.",
    context: "창업 5주년을 맞아",
    tags: ["창업", "실패", "성장"],
    isPublic: true,
  },
  {
    userIndex: 2,
    content: "투자자를 설득하는 것보다 팀원의 마음을 얻는 게 더 어렵다. 비전은 혼자 꾸는 꿈이 아니라, 함께 만들어가는 여정이다.",
    context: "힘든 피봇 결정 후",
    tags: ["리더십", "팀", "스타트업"],
    isPublic: true,
  },
  {
    userIndex: 3,
    content: "글을 쓴다는 것은 자신과의 대화다. 머릿속에서 맴돌던 생각이 종이 위에 내려앉는 순간, 비로소 그 무게를 느낄 수 있다.",
    context: "새벽 일기를 쓰며",
    tags: ["글쓰기", "자아성찰", "창작"],
    isPublic: true,
  },
  {
    userIndex: 3,
    content: "모든 사람은 자신만의 이야기를 가지고 있다. 지하철에서 스쳐 지나가는 수백 명의 얼굴, 그 뒤에 숨겨진 삶의 서사들을 상상해본다.",
    context: "출근길 지하철에서",
    tags: ["이야기", "사람", "관찰"],
    isPublic: true,
  },
  {
    userIndex: 4,
    content: "좋은 브랜드는 제품을 파는 게 아니라 정체성을 판다. 사람들은 물건이 아닌, 그 물건을 가진 자신의 모습을 구매한다.",
    context: "브랜드 전략 회의 후",
    tags: ["마케팅", "브랜딩", "심리"],
    isPublic: true,
  },
  {
    userIndex: 4,
    content: "철학책을 읽다가 깨달았다. 2000년 전 철학자들이 고민했던 것과 현대인의 고민이 크게 다르지 않다. 기술은 변해도 인간의 본질적 질문은 변하지 않는다.",
    context: "소크라테스 읽다가",
    tags: ["철학", "인간", "본질"],
    isPublic: true,
  },
  {
    userIndex: 0,
    content: "여백의 미. 동양화에서 배운 것을 UI에 적용해봤다. 가득 채우지 않아도, 아니 채우지 않기에 더 많은 것을 전달할 수 있다.",
    context: "미술관 다녀와서",
    tags: ["디자인", "동양철학", "여백"],
    isPublic: true,
  },
  {
    userIndex: 1,
    content: "오픈소스에 첫 기여를 했다. 전 세계 개발자들과 함께 무언가를 만든다는 것, 이것이 개발의 진정한 매력이 아닐까.",
    context: "GitHub 알림을 받고",
    tags: ["오픈소스", "협업", "개발"],
    isPublic: true,
  },
  {
    userIndex: 2,
    content: "고객 한 명의 피드백이 회사의 방향을 바꿨다. 사무실에서 전략을 짜는 것보다 현장에서 듣는 한 마디가 더 가치 있을 때가 있다.",
    context: "고객 인터뷰 후",
    tags: ["고객", "피드백", "비즈니스"],
    isPublic: true,
  },
  {
    userIndex: 3,
    content: "작가의 블록. 아무것도 쓸 수 없는 날들이 있다. 하지만 그 침묵의 시간도 결국 글의 일부가 된다는 걸 알게 됐다.",
    context: "한 달째 글을 못 쓰다가",
    tags: ["글쓰기", "슬럼프", "창작"],
    isPublic: true,
  },
  {
    userIndex: 4,
    content: "Z세대를 이해하려고 틱톡을 시작했다. 처음엔 어색했지만, 새로운 문화를 배우는 것 자체가 마케터의 자산이 된다.",
    context: "MZ 타겟 캠페인 준비하며",
    tags: ["마케팅", "세대", "트렌드"],
    isPublic: true,
  },
];

async function seed() {
  console.log("🌱 시드 데이터 생성 시작...\n");

  // 1. 기존 데이터 삭제
  console.log("🗑️  기존 데이터 삭제 중...");
  await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("bookmarks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("resonates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("inspirations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("✅ 기존 데이터 삭제 완료\n");

  // 2. 사용자 생성
  console.log("👥 사용자 생성 중...");
  const userIds: string[] = [];

  for (const user of users) {
    // 기존 사용자 확인
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ℹ️  ${user.displayName} 이미 존재 (${user.email})`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (error) {
        console.error(`  ❌ ${user.email} 생성 실패:`, error.message);
        continue;
      }
      userId = data.user.id;
      console.log(`  ✅ ${user.displayName} 생성 완료 (${user.email})`);
    }

    userIds.push(userId);

    // 프로필 업데이트
    await supabase.from("profiles").upsert({
      id: userId,
      display_name: user.displayName,
      bio: user.bio,
    });
  }
  console.log("");

  // 3. 영감 생성
  console.log("💡 영감 생성 중...");
  const inspirationIds: string[] = [];

  for (const insp of inspirations) {
    const userId = userIds[insp.userIndex];
    if (!userId) continue;

    const { data, error } = await supabase
      .from("inspirations")
      .insert({
        user_id: userId,
        content: insp.content,
        context: insp.context,
        tags: insp.tags,
        is_public: insp.isPublic,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ 영감 생성 실패:`, error.message);
    } else {
      inspirationIds.push(data.id);
      console.log(`  ✅ "${insp.content.substring(0, 30)}..." 생성 완료`);
    }
  }
  console.log("");

  // 4. 상호작용 생성 (공감, 북마크, 댓글)
  console.log("💬 상호작용 생성 중...");

  // 공감
  const resonatePairs = [
    [1, 0], [2, 0], [3, 0], [4, 0], // 첫 번째 영감에 4명 공감
    [0, 2], [2, 2], [4, 2], // 세 번째 영감에 3명 공감
    [0, 4], [1, 4], [3, 4], [4, 4], // 다섯 번째 영감에 4명 공감
    [0, 6], [1, 6], // 일곱 번째 영감에 2명 공감
    [2, 8], [3, 8], [4, 8], // 아홉 번째 영감에 3명 공감
    [0, 10], [1, 10], [2, 10], // 열한 번째 영감에 3명 공감
  ];

  for (const [userIdx, inspIdx] of resonatePairs) {
    if (userIds[userIdx] && inspirationIds[inspIdx]) {
      await supabase.from("resonates").insert({
        user_id: userIds[userIdx],
        inspiration_id: inspirationIds[inspIdx],
      });
    }
  }
  console.log("  ✅ 공감 생성 완료");

  // 북마크
  const bookmarkPairs = [
    [1, 0], [2, 4], [3, 2], [4, 6],
    [0, 8], [1, 10], [2, 12], [3, 14],
  ];

  for (const [userIdx, inspIdx] of bookmarkPairs) {
    if (userIds[userIdx] && inspirationIds[inspIdx]) {
      await supabase.from("bookmarks").insert({
        user_id: userIds[userIdx],
        inspiration_id: inspirationIds[inspIdx],
      });
    }
  }
  console.log("  ✅ 북마크 생성 완료");

  // 댓글
  const comments = [
    { userIdx: 1, inspIdx: 0, content: "정말 공감되는 말씀이에요. 저도 디자인할 때 항상 이 점을 염두에 두려고 합니다." },
    { userIdx: 2, inspIdx: 0, content: "좋은 디자인의 정의를 다시 생각하게 되네요." },
    { userIdx: 0, inspIdx: 2, content: "코드와 시의 비유가 인상적이에요. 개발도 결국 창작의 영역이죠." },
    { userIdx: 3, inspIdx: 4, content: "실패를 데이터로 보는 관점, 배울 점이 많습니다." },
    { userIdx: 4, inspIdx: 4, content: "저도 비슷한 경험이 있어서 더 와닿네요. 힘내세요!" },
    { userIdx: 1, inspIdx: 6, content: "글쓰기에 대한 깊은 통찰이네요. 저도 글을 쓸 때 비슷한 감정을 느낍니다." },
    { userIdx: 0, inspIdx: 8, content: "마케팅의 본질을 꿰뚫는 말씀이에요." },
    { userIdx: 2, inspIdx: 10, content: "동양 철학과 UI의 만남이라니, 흥미로운 접근입니다!" },
  ];

  for (const comment of comments) {
    if (userIds[comment.userIdx] && inspirationIds[comment.inspIdx]) {
      await supabase.from("comments").insert({
        user_id: userIds[comment.userIdx],
        inspiration_id: inspirationIds[comment.inspIdx],
        content: comment.content,
      });
    }
  }
  console.log("  ✅ 댓글 생성 완료\n");

  console.log("🎉 시드 데이터 생성 완료!");
  console.log("\n📋 생성된 테스트 계정:");
  users.forEach((u) => {
    console.log(`  - ${u.email} / ${u.password}`);
  });
}

seed().catch(console.error);
