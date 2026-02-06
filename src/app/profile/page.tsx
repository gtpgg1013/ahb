"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface Inspiration {
  id: string;
  content: string;
  context: string | null;
  tags: string[];
  created_at: string;
  resonates: { count: number }[];
}

interface BookmarkedInspiration {
  id: string;
  inspiration: {
    id: string;
    content: string;
    tags: string[];
    profiles: { display_name: string | null }[];
    resonates: { count: number }[];
  };
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedInspiration[]>([]);
  const [activeTab, setActiveTab] = useState<"inspirations" | "bookmarks">("inspirations");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inspirations: 0, totalResonates: 0 });

  // URL 파라미터로 탭 설정
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "bookmarks") {
      setActiveTab("bookmarks");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfileData();
    }
  }, [isLoaded, user]);

  const fetchProfileData = async () => {
    if (!user) return;

    const supabase = createClient();

    // Sync/create profile if needed
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    } else {
      // Create profile if doesn't exist
      const newProfile = {
        id: user.id,
        display_name: user.fullName || user.firstName || "익명",
        bio: null,
        username: null,
        avatar_url: user.imageUrl,
      };
      await supabase.from("profiles").insert(newProfile);
      setProfile(newProfile as Profile);
    }

    // Fetch user's inspirations
    const { data: inspirationsData } = await supabase
      .from("inspirations")
      .select(`
        id,
        content,
        context,
        tags,
        created_at,
        resonates (count)
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (inspirationsData) {
      setInspirations(inspirationsData);
      const totalResonates = inspirationsData.reduce(
        (sum, insp) => sum + (insp.resonates?.[0]?.count || 0),
        0
      );
      setStats({
        inspirations: inspirationsData.length,
        totalResonates,
      });
    }

    // Fetch bookmarks
    const { data: bookmarksData } = await supabase
      .from("bookmarks")
      .select(`
        id,
        inspiration:inspirations (
          id,
          content,
          tags,
          profiles (display_name),
          resonates (count)
        )
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (bookmarksData) {
      setBookmarks(bookmarksData as unknown as BookmarkedInspiration[]);
    }

    setLoading(false);
  };

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

  const getInitial = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">불러오는 중...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl">
                {getInitial(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.display_name || "이름 없음"}
                </h1>
                {profile.username && (
                  <p className="text-sm text-zinc-500">@{profile.username}</p>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {profile.bio || "아직 소개가 없습니다."}
              </p>
              <div className="mt-2 flex gap-6 text-sm">
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{stats.inspirations}</span>
                  <span className="text-zinc-500">영감</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold">{stats.totalResonates}</span>
                  <span className="text-zinc-500">총 공감</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">프로필 편집</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/new">+ 새 영감</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex border-b dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("inspirations")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "inspirations"
              ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          내 영감 ({inspirations.length})
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "bookmarks"
              ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          저장한 영감 ({bookmarks.length})
        </button>
      </div>

      {activeTab === "inspirations" && (
        <div className="flex flex-col gap-4">
          {inspirations.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-zinc-500">아직 작성한 영감이 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href="/new">첫 영감 기록하기</Link>
              </Button>
            </div>
          ) : (
            inspirations.map((inspiration) => (
              <Link href={`/inspiration/${inspiration.id}`} key={inspiration.id}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-4">
                    <p className="mb-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {inspiration.content}
                    </p>
                    {inspiration.context && (
                      <p className="mb-3 text-xs italic text-zinc-500">
                        — {inspiration.context}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {inspiration.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>♥ {inspiration.resonates?.[0]?.count || 0} 공감</span>
                        <span>{formatDate(inspiration.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "bookmarks" && (
        <div className="flex flex-col gap-4">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-zinc-500">저장한 영감이 없습니다.</p>
              <Button asChild className="mt-4">
                <Link href="/explore">영감 탐색하기</Link>
              </Button>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <Link href={`/inspiration/${bookmark.inspiration.id}`} key={bookmark.id}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitial(bookmark.inspiration.profiles?.[0]?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {bookmark.inspiration.profiles?.[0]?.display_name || "익명"}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {bookmark.inspiration.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {bookmark.inspiration.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        ♥ {bookmark.inspiration.resonates?.[0]?.count || 0} 공감
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
