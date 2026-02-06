"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface Inspiration {
  id: string;
  content: string;
  context: string | null;
  tags: string[];
  created_at: string;
  profiles: { display_name: string | null }[] | { display_name: string | null } | null;
  resonates: { count: number }[];
}

const popularTags = ["창업", "디자인", "개발", "글쓰기", "마케팅", "투자", "성장", "통찰"];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspirations();
  }, []);

  const fetchInspirations = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("inspirations")
      .select(`
        id,
        content,
        context,
        tags,
        created_at,
        profiles (display_name),
        resonates (count)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching inspirations:", error);
    } else {
      setInspirations(data || []);
    }
    setLoading(false);
  };

  const filteredInspirations = inspirations.filter((inspiration) => {
    const matchesSearch = inspiration.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag
      ? inspiration.tags?.includes(selectedTag)
      : true;
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "방금 전";
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const getDisplayName = (profiles: any) => {
    if (!profiles) return "익명";
    const name = Array.isArray(profiles) ? profiles[0]?.display_name : profiles?.display_name;
    return name || "익명";
  };

  const getInitial = (profiles: any) => {
    if (!profiles) return "?";
    const name = Array.isArray(profiles) ? profiles[0]?.display_name : profiles?.display_name;
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">영감 탐색</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          다른 사람들의 경험과 통찰에서 영감을 얻어보세요
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="영감 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button asChild>
          <Link href="/new">+ 영감 기록하기</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedTag(null)}
        >
          전체
        </Badge>
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">불러오는 중...</p>
        </div>
      ) : filteredInspirations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">
            {inspirations.length === 0
              ? "아직 영감이 없습니다. 첫 번째 영감을 기록해보세요!"
              : "검색 결과가 없습니다"}
          </p>
          <Button asChild className="mt-4">
            <Link href="/new">첫 영감 기록하기</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInspirations.map((inspiration) => (
            <Link href={`/inspiration/${inspiration.id}`} key={inspiration.id}>
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitial(inspiration.profiles)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getDisplayName(inspiration.profiles)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(inspiration.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {inspiration.content}
                  </p>
                  {inspiration.context && (
                    <p className="text-xs italic text-zinc-500">
                      — {inspiration.context}
                    </p>
                  )}
                  {inspiration.tags && inspiration.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {inspiration.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedTag(tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-3 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">
                      ♡ {inspiration.resonates?.[0]?.count || 0} 공감
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
