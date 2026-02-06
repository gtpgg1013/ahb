"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Notifications } from "@/components/notifications";

export function Header() {
  const { isSignedIn, user, isLoaded } = useUser();

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

          {!isLoaded ? (
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          ) : isSignedIn ? (
            <>
              <Button size="sm" asChild>
                <Link href="/new">+ 새 영감</Link>
              </Button>
              <Notifications userId={user.id} />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </SignInButton>
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
