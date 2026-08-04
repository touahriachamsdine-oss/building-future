"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Mail, Lock, Globe, Shield, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signInAction, getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          if (user.role === 'ADMIN') {
            router.push('/admin');
          } else if (user.role === 'PROVIDER') {
            router.push('/dashboard/provider');
          } else {
            router.push('/categories/building-materials');
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signInAction(email, password);

      if (!res.success) {
        throw new Error(res.error);
      }

      if (res.user) {
        if (res.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (res.user.role === 'PROVIDER') {
          router.push('/dashboard/provider');
        } else {
          router.push('/categories/building-materials');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل تسجيل الدخول. يرجى التحقق من بياناتك.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Right side: Image/Context (Visible on Desktop) */}
      <div className="hidden lg:flex relative bg-primary items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 diagonal-bg opacity-20"></div>
        <div className="z-10 space-y-8 text-white max-w-lg text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-black leading-tight">مرحباً بك مجدداً في بناء المستقبل</h2>
            <p className="text-xl text-white/80 mt-6 leading-relaxed">
              سجل دخولك للوصول إلى مشاريعك، تواصل مع الموردين، وإدارة أعمالك في قطاع البناء.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="text-3xl font-bold">+15k</div>
                <div className="text-sm opacity-60">مستخدم نشط</div>
             </div>
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <div className="text-3xl font-bold">58</div>
                <div className="text-sm opacity-60">ولاية مغطاة</div>
             </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>
      </div>

      {/* Left side: Form */}
      <div className="flex items-center justify-center p-8 lg:p-24 bg-background">
        <motion.div 
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2 text-right">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all mb-8 font-bold">
               العودة للرئيسية <ArrowLeft size={18} />
            </Link>
            <h1 className="text-4xl font-black">تسجيل الدخول</h1>
            <p className="text-muted-foreground">أدخل بياناتك للمتابعة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2 text-right">
              <label className="text-sm font-medium mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pr-12 text-right" 
                  placeholder="name@example.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between items-center mb-2">
                <Link href="#" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</Link>
                <label className="text-sm font-medium">كلمة المرور</label>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pr-12 pl-12 text-right" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              variant="brutal" 
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "دخول"}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">أو المتابعة عبر</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2" type="button">
               Google <Globe size={18} />
            </Button>
            <Button variant="outline" className="gap-2" type="button">
               Github <Shield size={18} />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
               أنشئ حساباً الآن
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
