"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Bell, CheckCheck, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  message: string;
  listing_id: string | null;
  listing_title: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifs(data as unknown as Notification[]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) { router.push("/login"); return; }
      fetchNotifs();
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Bell size={28} className="text-primary" />
          الإشعارات
        </h1>
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Bell size={60} className="mx-auto text-muted-foreground/30" />
          <h3 className="text-xl font-bold text-muted-foreground">لا توجد إشعارات</h3>
          <p className="text-muted-foreground/60">ستظهر هنا الإشعارات المتعلقة بطلباتك ورسائلك</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck size={16} />
              تحديد الكل كمقروء
            </Button>
          </div>

          {notifs.map((n) => (
            <div
              key={n.id}
              className={cn(
                "p-4 sm:p-6 rounded-2xl border-2 transition-all",
                n.is_read
                  ? "bg-card border-border"
                  : "bg-primary/5 border-primary/30 shadow-md"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className={cn("text-sm", n.is_read ? "text-muted-foreground" : "text-foreground font-medium")}>
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(n.created_at).toLocaleDateString("ar-DZ", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 p-2 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                    title="تحديد كمقروء"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
              </div>
              {n.listing_id && (
                <Link
                  href={`/listings/${n.listing_id}`}
                  className="inline-block mt-3 text-xs text-primary font-medium hover:underline"
                >
                  عرض الإعلان
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
