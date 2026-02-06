import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const POPULAR_TAGS = [
  "창업", "디자인", "개발", "글쓰기", "마케팅", "투자", "성장", "통찰",
  "리더십", "팀빌딩", "실패", "성공", "UX", "제품", "철학", "클린코드",
  "커리어", "학습", "창의성", "혁신", "비즈니스", "스타트업", "데이터",
  "AI", "기술", "문화", "예술", "음악", "여행", "건강", "관계", "소통"
];

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Check if ANTHROPIC_API_KEY is set
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return fallback tags based on simple keyword matching
      const fallbackTags = suggestFallbackTags(content);
      return NextResponse.json({ tags: fallbackTags });
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `다음 영감/인사이트에 어울리는 태그를 3-5개 추천해주세요.
기존 인기 태그 목록: ${POPULAR_TAGS.join(", ")}

가능하면 기존 태그에서 선택하되, 적합한 게 없으면 새로운 태그를 만들어도 됩니다.
태그만 쉼표로 구분해서 응답해주세요 (설명 없이).

영감 내용:
"${content}"`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const tags = responseText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length <= 20)
      .slice(0, 5);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error suggesting tags:", error);
    // Return fallback on error
    const { content } = await request.json().catch(() => ({ content: "" }));
    const fallbackTags = suggestFallbackTags(content || "");
    return NextResponse.json({ tags: fallbackTags });
  }
}

function suggestFallbackTags(content: string): string[] {
  const contentLower = content.toLowerCase();
  const matchedTags: string[] = [];

  const keywordMap: Record<string, string[]> = {
    "창업": ["창업", "스타트업", "사업", "회사", "대표"],
    "디자인": ["디자인", "UI", "UX", "색상", "레이아웃"],
    "개발": ["개발", "코드", "프로그래밍", "기술", "엔지니어"],
    "마케팅": ["마케팅", "광고", "브랜드", "고객", "판매"],
    "투자": ["투자", "자금", "펀딩", "투자자", "벤처"],
    "성장": ["성장", "발전", "배움", "학습", "경험"],
    "리더십": ["리더", "리더십", "팀", "조직", "관리"],
    "실패": ["실패", "실수", "망", "어려움", "극복"],
    "통찰": ["통찰", "깨달음", "인사이트", "생각", "관점"],
  };

  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((keyword) => contentLower.includes(keyword))) {
      matchedTags.push(tag);
    }
  }

  return matchedTags.slice(0, 5);
}
