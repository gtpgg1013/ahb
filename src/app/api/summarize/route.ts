import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // If no API key, return a simple summary
    if (!process.env.ANTHROPIC_API_KEY) {
      const simpleSummary = content.length > 100
        ? content.substring(0, 100) + "..."
        : content;
      return NextResponse.json({
        summary: simpleSummary,
        keyPoints: [],
        actionItems: [],
      });
    }

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `다음 영감/인사이트를 분석해주세요.

1. 한 문장 요약 (20자 내외)
2. 핵심 포인트 2-3개 (각 10자 내외)
3. 실천할 수 있는 액션 아이템 1-2개 (있다면)

JSON 형식으로만 응답해주세요:
{"summary": "...", "keyPoints": ["...", "..."], "actionItems": ["..."]}

영감 내용:
"${content}"`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // If parsing fails, return raw summary
    }

    return NextResponse.json({
      summary: responseText.substring(0, 100),
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
