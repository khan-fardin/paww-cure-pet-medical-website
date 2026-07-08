"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  Check,
  CircleDollarSign,
  Headphones,
  MessageSquareText,
  Star,
} from "lucide-react";

type NotificationItem = {
  _id: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  title: string;
  type: string;
};

const iconMap = {
  booking: CalendarCheck,
  consultation: MessageSquareText,
  payment: CircleDollarSign,
  payout: CircleDollarSign,
  review: Star,
  support: Headphones,
  system: Bell,
} as const;

export function NotificationBar() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
        credentials: "include",
      });
      const payload = (await response.json()) as {
        data?: NotificationItem[];
        unreadCount?: number;
      };
      if (response.ok) {
        setItems(payload.data ?? []);
        setUnreadCount(payload.unreadCount ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  async function markRead(notificationId: string) {
    const wasUnread = items.some(
      (item) => item._id === notificationId && !item.isRead
    );
    setItems((current) =>
      current.map((item) =>
        item._id === notificationId ? { ...item, isRead: true } : item
      )
    );
    if (wasUnread) setUnreadCount((current) => Math.max(current - 1, 0));
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", notificationId }),
    });
  }

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Notifications"
        className="relative inline-flex h-10 items-center gap-2 rounded-full border border-slate-100 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm sm:px-4"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Alerts</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-3 top-20 z-[160] max-h-[70vh] overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[380px]">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <p className="font-bold text-slate-950">Notifications</p>
              <p className="text-xs text-slate-400">{unreadCount} unread</p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 disabled:text-slate-300"
              disabled={unreadCount === 0}
              onClick={() => void markAllRead()}
              type="button"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[58vh] overflow-y-auto p-2">
            {isLoading ? (
              <p className="p-5 text-center text-sm text-slate-500">
                Loading notifications...
              </p>
            ) : items.length === 0 ? (
              <p className="p-8 text-center text-sm font-semibold text-slate-500">
                You are all caught up.
              </p>
            ) : (
              items.map((item) => {
                const Icon =
                  iconMap[item.type as keyof typeof iconMap] ?? Bell;
                const content = (
                  <div
                    className={`flex gap-3 rounded-[1.5rem] p-4 transition ${
                      item.isRead ? "bg-white" : "bg-emerald-50"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {item.body}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!item.isRead ? (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    ) : null}
                  </div>
                );

                return item.link ? (
                  <Link
                    href={item.link}
                    key={item._id}
                    onClick={() => {
                      void markRead(item._id);
                      setIsOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    className="block w-full text-left"
                    key={item._id}
                    onClick={() => void markRead(item._id)}
                    type="button"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
