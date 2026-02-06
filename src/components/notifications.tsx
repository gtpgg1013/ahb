"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  actor_id: string | null;
  inspiration_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: { display_name: string | null }[];
}

export function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select(`
        id,
        type,
        actor_id,
        inspiration_id,
        is_read,
        created_at,
        actor:profiles!actor_id (display_name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as unknown as Notification[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor?.[0]?.display_name || "누군가";

    switch (notification.type) {
      case "resonate":
        return `${actorName}님이 회원님의 영감에 공감했습니다.`;
      case "comment":
        return `${actorName}님이 회원님의 영감에 댓글을 남겼습니다.`;
      case "bookmark":
        return `${actorName}님이 회원님의 영감을 저장했습니다.`;
      default:
        return "새로운 알림이 있습니다.";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b p-3 dark:border-zinc-800">
              <h3 className="font-medium">알림</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={markAllAsRead}
                >
                  모두 읽음
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-zinc-500">
                  알림이 없습니다.
                </p>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.inspiration_id
                        ? `/inspiration/${notification.inspiration_id}`
                        : "#"
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={`border-b p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 ${
                        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <p className="text-sm">{getNotificationText(notification)}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
