"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ShieldCheck, Clock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.replace("/login");
      else if (u.role !== "PROVIDER" || u.is_verified !== false) router.replace("/");
      else setUser(u);
    });
  }, [router]);

  // Poll every 15s for approval
  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/check-approval");
        const data = await res.json();
        if (data.approved) {
          window.location.href = "/";
        }
      } catch {
        // ignore network errors
      } finally {
        setChecking(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
          <Clock size={52} className="text-amber-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-foreground">طلبك قيد المراجعة</h1>
          <p className="text-muted-foreground leading-relaxed">
            شكراً لتسجيلك في منصة بناء المستقبل. حسابك قيد المراجعة من قبل فريق الإشراف.
            سيتم تحديث الصفحة تلقائياً عند الموافقة على طلبك.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">البريد الإلكتروني المسجل</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">حالة الحساب</p>
              <p className="text-xs text-amber-500 font-medium flex items-center gap-2">
                في انتظار الموافقة
                {checking && <Loader2 size={12} className="animate-spin" />}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/" className="text-primary font-bold hover:underline text-sm block">
            العودة للصفحة الرئيسية
          </Link>
          <p className="text-xs text-muted-foreground">
            إذا استغرقت المراجعة وقتاً طويلاً، يرجى التواصل مع فريق الدعم.
          </p>
        </div>
      </div>
    </div>
  );
}
