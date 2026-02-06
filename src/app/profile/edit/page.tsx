"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    if (!user) return;

    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    } else {
      // Set defaults from Clerk user
      setDisplayName(user.fullName || user.firstName || "");
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
      });

    if (error) {
      console.error("Error updating profile:", error);
      alert("프로필 업데이트에 실패했습니다.");
    } else {
      router.push("/profile");
    }

    setSaving(false);
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>프로필 편집</CardTitle>
          <CardDescription>
            다른 사람들에게 보여질 프로필 정보를 수정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                이름
              </label>
              <Input
                id="displayName"
                placeholder="홍길동"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                사용자명
              </label>
              <Input
                id="username"
                placeholder="gildong"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              />
              <p className="text-xs text-zinc-500">
                영문, 숫자, 밑줄(_)만 사용 가능합니다.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="text-sm font-medium">
                소개
              </label>
              <Textarea
                id="bio"
                placeholder="자신을 소개해주세요"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-zinc-500">{bio.length}/200자</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
