"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface Inspiration {
  id: string;
  user_id: string;
  content: string;
  context: string | null;
  tags: string[];
  is_public: boolean;
  created_at: string;
  image_url: string | null;
  link_url: string | null;
  profiles: { display_name: string | null }[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string | null }[];
}

export default function InspirationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Interactions
  const [isResonated, setIsResonated] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [resonateCount, setResonateCount] = useState(0);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editContext, setEditContext] = useState("");

  // Comment input
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // AI Summary
  const [summary, setSummary] = useState<{
    summary: string;
    keyPoints: string[];
    actionItems: string[];
  } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    // Fetch inspiration
    const { data: inspirationData, error } = await supabase
      .from("inspirations")
      .select(`
        *,
        profiles (display_name)
      `)
      .eq("id", id)
      .single();

    if (error || !inspirationData) {
      router.push("/explore");
      return;
    }

    setInspiration(inspirationData);
    setEditContent(inspirationData.content);
    setEditContext(inspirationData.context || "");

    // Fetch resonate count
    const { count: resonateCountData } = await supabase
      .from("resonates")
      .select("*", { count: "exact", head: true })
      .eq("inspiration_id", id);

    setResonateCount(resonateCountData || 0);

    // Check if user has resonated
    if (user) {
      const { data: userResonate } = await supabase
        .from("resonates")
        .select("id")
        .eq("inspiration_id", id)
        .eq("user_id", user.id)
        .single();

      setIsResonated(!!userResonate);

      // Check if user has bookmarked
      const { data: userBookmark } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("inspiration_id", id)
        .eq("user_id", user.id)
        .single();

      setIsBookmarked(!!userBookmark);
    }

    // Fetch comments
    const { data: commentsData } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        profiles (display_name)
      `)
      .eq("inspiration_id", id)
      .order("created_at", { ascending: true });

    if (commentsData) {
      setComments(commentsData as Comment[]);
    }

    setLoading(false);
  };

  const handleResonate = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    const supabase = createClient();

    if (isResonated) {
      await supabase
        .from("resonates")
        .delete()
        .eq("inspiration_id", id)
        .eq("user_id", currentUserId);
      setIsResonated(false);
      setResonateCount((prev) => prev - 1);
    } else {
      await supabase.from("resonates").insert({
        inspiration_id: id,
        user_id: currentUserId,
      });
      setIsResonated(true);
      setResonateCount((prev) => prev + 1);

      // Send notification (only if not own inspiration)
      if (inspiration && inspiration.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: inspiration.user_id,
          type: "resonate",
          actor_id: currentUserId,
          inspiration_id: id,
        });
      }
    }
  };

  const handleBookmark = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    const supabase = createClient();

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("inspiration_id", id)
        .eq("user_id", currentUserId);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({
        inspiration_id: id,
        user_id: currentUserId,
      });
      setIsBookmarked(true);

      // Send notification (only if not own inspiration)
      if (inspiration && inspiration.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: inspiration.user_id,
          type: "bookmark",
          actor_id: currentUserId,
          inspiration_id: id,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const supabase = createClient();
    await supabase.from("inspirations").delete().eq("id", id);
    router.push("/profile");
  };

  const handleSaveEdit = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("inspirations")
      .update({
        content: editContent.trim(),
        context: editContext.trim() || null,
      })
      .eq("id", id);

    if (!error) {
      setInspiration((prev) =>
        prev ? { ...prev, content: editContent.trim(), context: editContext.trim() || null } : null
      );
      setIsEditing(false);
    }
  };

  const handleAddComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    setSubmittingComment(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        inspiration_id: id,
        user_id: currentUserId,
        content: newComment.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        profiles (display_name)
      `)
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setNewComment("");

      // Send notification (only if not own inspiration)
      if (inspiration && inspiration.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: inspiration.user_id,
          type: "comment",
          actor_id: currentUserId,
          inspiration_id: id,
        });
      }
    }

    setSubmittingComment(false);
  };

  const handleGetSummary = async () => {
    if (!inspiration) return;
    setLoadingSummary(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inspiration.content }),
      });

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error getting summary:", error);
    }

    setLoadingSummary(false);
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

  if (!inspiration) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">영감을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isOwner = currentUserId === inspiration.user_id;
  const authorName = inspiration.profiles?.[0]?.display_name || "익명";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">{getInitial(authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{authorName}</p>
              <p className="text-sm text-zinc-500">{formatDate(inspiration.created_at)}</p>
            </div>
          </div>
          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                수정
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isEditing ? (
            <>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[150px]"
              />
              <Input
                placeholder="맥락 (선택)"
                value={editContext}
                onChange={(e) => setEditContext(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveEdit}>저장</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg leading-relaxed">{inspiration.content}</p>
              {inspiration.context && (
                <p className="text-sm italic text-zinc-500">— {inspiration.context}</p>
              )}
              {inspiration.image_url && (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={inspiration.image_url}
                    alt="영감 이미지"
                    className="max-h-96 w-full object-cover"
                  />
                </div>
              )}
              {inspiration.link_url && (
                <a
                  href={inspiration.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  🔗 {inspiration.link_url}
                </a>
              )}
              {inspiration.tags && inspiration.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {inspiration.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}

          {/* AI Summary */}
          {!isEditing && (
            <div className="border-t pt-4 dark:border-zinc-800">
              {!summary ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGetSummary}
                  disabled={loadingSummary}
                  className="text-xs"
                >
                  {loadingSummary ? "분석 중..." : "AI 요약 보기"}
                </Button>
              ) : (
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                  <p className="mb-2 text-sm font-medium">AI 요약</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{summary.summary}</p>
                  {summary.keyPoints.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500">핵심 포인트</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {summary.keyPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.actionItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500">실천 아이템</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {summary.actionItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 border-t pt-4 dark:border-zinc-800">
            <Button
              variant={isResonated ? "default" : "outline"}
              size="sm"
              onClick={handleResonate}
            >
              {isResonated ? "♥" : "♡"} {resonateCount} 공감
            </Button>
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
            >
              {isBookmarked ? "★ 저장됨" : "☆ 저장"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">댓글 ({comments.length})</h2>

        {currentUserId ? (
          <div className="mb-6 flex gap-2">
            <Input
              placeholder="댓글을 작성하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
            />
            <Button onClick={handleAddComment} disabled={submittingComment || !newComment.trim()}>
              {submittingComment ? "..." : "등록"}
            </Button>
          </div>
        ) : (
          <p className="mb-6 text-sm text-zinc-500">
            <Link href="/login" className="underline">
              로그인
            </Link>
            하면 댓글을 작성할 수 있습니다.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">아직 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {getInitial(comment.profiles?.[0]?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.profiles?.[0]?.display_name || "익명"}
                    </span>
                    <span className="text-xs text-zinc-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link href="/explore">목록으로</Link>
        </Button>
      </div>
    </div>
  );
}
