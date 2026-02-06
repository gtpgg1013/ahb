"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Notifications } from "@/components/notifications";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [mounted, pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getInitial = (user: User) => {
    const name = user.user_metadata?.full_name || user.email;
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            As Human Being
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            탐색
          </Link>

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          ) : user ? (
            <>
              <Button size="sm" asChild>
                <Link href="/new">+ 새 영감</Link>
              </Button>
              <Notifications userId={user.id} />
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="text-sm">
                    {getInitial(user)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">시작하기</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
