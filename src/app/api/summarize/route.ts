import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // If no API key, return a placeholder
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        summary: "영감의 조각",
        keyPoints: [],
        actionItems: [],
      });
    }

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `당신은 영화평론가 이동진처럼 한 줄 코멘트를 작성하는 전문가입니다.

다음 영감을 읽고, 이동진 스타일의 한 줄 코멘트를 작성해주세요.

규칙:
- 15자 이내의 명사형 문장
- 시적이고 함축적인 표현
- 동사가 아닌 명사로 끝날 것
- 따옴표나 부가 설명 없이 코멘트만 출력

예시:
- "삶의 무게를 견디는 법"
- "흔들리지 않는 것들의 힘"
- "실패가 남긴 씨앗"

영감 내용:
"${content}"`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // 따옴표 제거하고 깔끔하게 반환
    const cleanSummary = responseText.replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({
      summary: cleanSummary,
      keyPoints: [],
      actionItems: [],
    });
  } catch (error) {
    console.error("Error summarizing:", error);
    return NextResponse.json(
      { summary: "요약을 생성할 수 없습니다.", keyPoints: [], actionItems: [] },
      { status: 500 }
    );
  }
}
