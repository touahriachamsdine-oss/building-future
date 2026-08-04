"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getUnreadNotificationCount } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchCount = async () => {
    try {
      const c = await getUnreadNotificationCount();
      setCount(c);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }).catch(() => setIsLoggedIn(false));
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-lg hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {count > 0 && (
        <span className={cn(
          "absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
          "min-w-[18px] min-h-[18px]"
        )}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
