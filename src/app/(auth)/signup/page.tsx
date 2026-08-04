"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle, ArrowLeft, Loader2, Eye, EyeOff, Phone, MapPin, Briefcase, Wrench } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { signUpAction, getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { WILAYAS } from "@/lib/wilayas";

export default function SignupPage() {
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("1");
  const [baladia, setBaladia] = useState("");
  const [providerType, setProviderType] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
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
            router.push('/dashboard/client');
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };
    checkSession();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signUpAction(fullName, email, password, role, {
        phone: phone || undefined,
        wilaya: parseInt(wilaya),
        baladia: baladia || undefined,
        provider_type: providerType || undefined,
        specialty: specialty || undefined,
        bio: bio || undefined,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      if (res.user) {
        // Redirect based on role
        router.push(role === 'PROVIDER' ? '/dashboard/provider' : '/dashboard/client');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Right side: Branding (Visible on Desktop) */}
      <div className="hidden lg:flex relative bg-zinc-900 items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 diagonal-bg opacity-10"></div>
        <div className="z-10 space-y-12 text-right" dir="rtl">
          <div className="inline-flex items-center gap-3">
             <div className="w-12 h-12 bg-primary rounded-xl shadow-brutal border-2 border-black flex items-center justify-center text-white text-2xl font-black">ب</div>
             <span className="text-3xl font-black text-white">بناء المستقبل</span>
          </div>

          <div className="space-y-8">
            <h2 className="text-5xl font-black text-white leading-tight">ابدأ رحلتك المعمارية اليوم</h2>
            <div className="space-y-6">
               {[
                 "أكبر شبكة للمهنيين",
                 "نظام دفع وحجز آمن وموثوق",
                 "إدارة مشاريعك بكل سهولة"
               ].map((text, i) => (
                 <div key={i} className="flex items-center gap-4 text-white/70 text-lg">
                    <CheckCircle className="text-primary" size={24} />
                    <span>{text}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Left side: Signup Form */}
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
            <h1 className="text-4xl font-black">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground">انضم إلى مجتمع البناء الرقمي</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRole('CLIENT')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center space-y-2",
                role === 'CLIENT' ? "border-primary bg-primary/10" : "border-white/5 hover:border-primary/50"
              )}
            >
              <div className={cn("w-10 h-10 mx-auto rounded-full flex items-center justify-center", role === 'CLIENT' ? "bg-primary text-white" : "bg-zinc-800")}>
                 <User size={20} />
              </div>
              <div className="font-bold">أنا زبون</div>
              <div className="text-xs text-muted-foreground">أبحث عن مواد أو خدمات</div>
            </button>
            <button 
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center space-y-2",
                role === 'PROVIDER' ? "border-primary bg-primary/10" : "border-white/5 hover:border-primary/50"
              )}
            >
              <div className={cn("w-10 h-10 mx-auto rounded-full flex items-center justify-center", role === 'PROVIDER' ? "bg-primary text-white" : "bg-zinc-800")}>
                 <CheckCircle size={20} />
              </div>
              <div className="font-bold">أنا مزود</div>
              <div className="text-xs text-muted-foreground">أريد عرض خدماتي أو سلعي</div>
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2 text-right">
              <label className="text-sm font-medium mr-1">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pr-12 text-right" 
                  placeholder="أدخل اسمك الكامل" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-medium mr-1">كلمة المرور</label>
            <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pr-12 pl-12 text-right" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="6 أحرف على الأقل" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            {/* Phone */}
            <div className="space-y-2 text-right">
              <label className="text-sm font-medium mr-1">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  className="pr-12 text-right"
                  placeholder="05XX XX XX XX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Wilaya */}
            <div className="space-y-2 text-right">
              <label className="text-sm font-medium mr-1">الولاية</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full h-12 pr-12 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  {WILAYAS.map(w => (
                    <option key={w.id} value={String(w.id)}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Baladia */}
            <div className="space-y-2 text-right">
              <label className="text-sm font-medium mr-1">البلدية</label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  className="pr-12 text-right"
                  placeholder="مثال: بئر مراد رايس، سيدي امحمد..."
                  value={baladia}
                  onChange={(e) => setBaladia(e.target.value)}
                />
              </div>
            </div>

            {/* Provider fields */}
            {role === 'PROVIDER' && (
              <>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-medium mr-1">نوع التزويد</label>
                  <div className="relative">
                    <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                    <select
                      value={providerType}
                      onChange={(e) => { setProviderType(e.target.value); if (e.target.value !== 'CRAFTSMAN') { setSpecialty(''); setBio(''); } }}
                      className="w-full h-12 pr-12 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="">-- اختر نوع التزويد --</option>
                      <option value="CRAFTSMAN">حرفي</option>
                      <option value="MATERIAL_SUPPLIER">مورد مواد</option>
                      <option value="EQUIPMENT_OWNER">صاحب عتاد</option>
                      <option value="TRANSPORTER">ناقل</option>
                    </select>
                  </div>
                </div>

                {providerType === 'CRAFTSMAN' && (
                  <>
                    <div className="space-y-2 text-right">
                      <label className="text-sm font-medium mr-1">التخصص</label>
                      <div className="relative">
                        <Wrench className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          className="pr-12 text-right"
                          placeholder="مثال: سباك، كهربائي، بلاط..."
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-right">
                      <label className="text-sm font-medium mr-1">الخبرات والمهارات</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="صف خبراتك وماذا يمكنك تقديمه..."
                        className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <Button 
              type="submit"
              variant="brutal" 
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
               تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
