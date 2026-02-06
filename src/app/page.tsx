import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 0; // 항상 최신 상태 확인

async function getUser() {
  const { userId } = await auth();
  return userId;
}

async function getRecentInspirations() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("inspirations")
    .select(`
      id,
      content,
      tags,
      created_at,
      profiles (display_name),
      resonates (count)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return data || [];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function getInitial(name: string | null) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

export default async function Home() {
  const [user, inspirations] = await Promise.all([getUser(), getRecentInspirations()]);
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-6 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          인간만이 줄 수 있는
          <br />
          <span className="text-zinc-500">영감</span>을 나눕니다
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          AI가 실행을 담당하는 시대, 인간 고유의 가치인 영감을 주고받는 공간입니다.
          당신의 경험, 통찰, 그리고 이야기가 누군가에게 불꽃이 됩니다.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href={isLoggedIn ? "/new" : "/signup"}>
              {isLoggedIn ? "새 영감 기록하기" : "영감 나누기 시작"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">영감 탐색하기</Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">최근 영감</h2>
          <Link
            href="/explore"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            더 보기 &rarr;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inspirations.length === 0 ? (
            <p className="col-span-full text-center text-zinc-500">
              아직 공유된 영감이 없습니다. 첫 번째 영감을 나눠보세요!
            </p>
          ) : (
            inspirations.map((inspiration: any) => {
              // profiles can be array or object depending on relationship
              const profiles = inspiration.profiles;
              const authorName = Array.isArray(profiles)
                ? profiles[0]?.display_name
                : profiles?.display_name;
              const displayName = authorName || "익명";
              const resonateCount = inspiration.resonates?.[0]?.count || 0;

              return (
                <Link key={inspiration.id} href={`/inspiration/${inspiration.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitial(displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{displayName}</span>
                        <span className="text-xs text-zinc-500">
                          {formatDate(inspiration.created_at)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-3">
                        {inspiration.content}
                      </p>
                      {inspiration.tags && inspiration.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {inspiration.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        <span>{resonateCount}</span>
                        <span>공감</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-xl bg-zinc-100 p-8 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold">당신의 영감을 나눠주세요</h2>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            경험에서 우러나온 통찰, 직관적인 아이디어, 삶의 이야기...
            인간만이 전할 수 있는 영감이 여기 있습니다.
          </p>
          <Button size="lg" asChild>
            <Link href={isLoggedIn ? "/new" : "/signup"}>
              {isLoggedIn ? "새 영감 기록하기" : "무료로 시작하기"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
