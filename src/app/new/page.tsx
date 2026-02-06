"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function NewInspirationPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [content, setContent] = useState("");
  const [context, setContext] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [profileReady, setProfileReady] = useState(false);

  // Sync Clerk user with Supabase profile
  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          display_name: user.fullName || user.firstName || "익명",
        });
      }
      setProfileReady(true);
    };

    if (isLoaded && user) {
      syncProfile();
    }
  }, [user, isLoaded]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const suggestTags = async () => {
    if (!content.trim()) return;

    setSuggestingTags(true);
    try {
      const response = await fetch("/api/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();
      if (data.tags && Array.isArray(data.tags)) {
        // Add suggested tags that aren't already added
        const newTags = data.tags.filter(
          (tag: string) => !tags.includes(tag) && tags.length + data.tags.indexOf(tag) < 5
        );
        setTags((prev) => [...prev, ...newTags].slice(0, 5));
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
    }
    setSuggestingTags(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !profileReady) return;

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("inspirations").insert({
      user_id: user.id,
      content: content.trim(),
      context: context.trim() || null,
      tags,
      is_public: isPublic,
      image_url: imageUrl.trim() || null,
      link_url: linkUrl.trim() || null,
    });

    if (error) {
      console.error("Failed to create inspiration:", error);
      setLoading(false);
      return;
    }

    router.push("/explore");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">영감 기록하기</CardTitle>
          <CardDescription>
            당신의 경험, 통찰, 아이디어를 나눠주세요.
            누군가에게 불꽃이 될 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                영감 내용 <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="content"
                placeholder="어떤 영감을 나누고 싶으신가요? 경험에서 우러나온 통찰, 직관적인 아이디어, 삶의 이야기..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
                required
              />
              <p className="text-xs text-zinc-500">
                {content.length}/500자
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="context" className="text-sm font-medium">
                맥락 (선택)
              </label>
              <Input
                id="context"
                placeholder="이 영감이 떠오른 상황이나 배경이 있다면 적어주세요"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <p className="text-xs text-zinc-500">
                어떤 상황에서 이 생각이 떠올랐나요?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">
                이미지 URL (선택)
              </label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border">
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    className="max-h-48 w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="linkUrl" className="text-sm font-medium">
                관련 링크 (선택)
              </label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://example.com/article"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tags" className="text-sm font-medium">
                  태그 (최대 5개)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={suggestTags}
                  disabled={suggestingTags || !content.trim() || tags.length >= 5}
                  className="text-xs"
                >
                  {suggestingTags ? "추천 중..." : "AI 태그 추천"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="태그 입력 후 Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={tags.length >= 5}
                >
                  추가
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <label htmlFor="isPublic" className="text-sm">
                공개하기 (다른 사람들이 이 영감을 볼 수 있습니다)
              </label>
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
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !content.trim() || !profileReady}
              >
                {loading ? "저장 중..." : "영감 공유하기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
