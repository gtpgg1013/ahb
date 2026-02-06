import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      // Return random public inspirations for non-logged in users
      const { data: randomInspirations } = await supabase
        .from("inspirations")
        .select(`
          id,
          content,
          context,
          tags,
          created_at,
          image_url,
          link_url,
          profiles (display_name),
          resonates (count)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(6);

      return NextResponse.json({ inspirations: randomInspirations || [], type: "recent" });
    }

    // Get user's recent interactions to understand preferences
    const [resonatesResult, bookmarksResult] = await Promise.all([
      supabase
        .from("resonates")
        .select("inspiration_id, inspirations (tags)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("bookmarks")
        .select("inspiration_id, inspirations (tags)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // Extract tags from user interactions
    const interactedTags: string[] = [];
    const interactedInspirationIds: string[] = [];

    resonatesResult.data?.forEach((r: any) => {
      interactedInspirationIds.push(r.inspiration_id);
      if (r.inspirations?.tags) {
        interactedTags.push(...r.inspirations.tags);
      }
    });

    bookmarksResult.data?.forEach((b: any) => {
      interactedInspirationIds.push(b.inspiration_id);
      if (b.inspirations?.tags) {
        interactedTags.push(...b.inspirations.tags);
      }
    });

    // Count tag frequency
    const tagCounts: Record<string, number> = {};
    interactedTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Get top tags
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    if (topTags.length === 0) {
      // No interactions yet, return recent popular inspirations
      const { data: popularInspirations } = await supabase
        .from("inspirations")
        .select(`
          id,
          content,
          context,
          tags,
          created_at,
          image_url,
          link_url,
          profiles (display_name),
          resonates (count)
        `)
        .eq("is_public", true)
        .neq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      return NextResponse.json({ inspirations: popularInspirations || [], type: "recent" });
    }

    // Find inspirations with matching tags that user hasn't interacted with
    const { data: recommendedInspirations } = await supabase
      .from("inspirations")
      .select(`
        id,
        content,
        context,
        tags,
        created_at,
        image_url,
        link_url,
        profiles (display_name),
        resonates (count)
      `)
      .eq("is_public", true)
      .neq("user_id", userId)
      .not("id", "in", `(${interactedInspirationIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
      .overlaps("tags", topTags)
      .order("created_at", { ascending: false })
      .limit(6);

    return NextResponse.json({
      inspirations: recommendedInspirations || [],
      type: "personalized",
      basedOnTags: topTags,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ inspirations: [], type: "error" }, { status: 500 });
  }
}
