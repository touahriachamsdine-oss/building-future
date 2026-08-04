"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { WILAYAS } from "@/lib/wilayas";
import { updateUserProfile } from "@/lib/db";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Briefcase, FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

interface ProfileClientProps {
  initialProfile: {
    id: string;
    role: string;
    full_name: string | null;
    phone: string | null;
    wilaya: number | null;
    baladia: string | null;
    avatar_url: string | null;
    bio: string | null;
    provider_type: string | null;
    specialty: string | null;
  };
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256"
];

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [wilaya, setWilaya] = useState<number>(initialProfile.wilaya || 16);
  const [baladia, setBaladia] = useState(initialProfile.baladia || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || PRESET_AVATARS[0]);
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [providerType, setProviderType] = useState(initialProfile.provider_type || "INDIVIDUAL");
  const [specialty, setSpecialty] = useState(initialProfile.specialty || "");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updateData: {
        full_name: string;
        phone: string;
        wilaya: number;
        baladia: string;
        avatar_url: string;
        bio: string;
        provider_type?: string;
        specialty?: string;
      } = {
        full_name: fullName,
        phone: phone,
        wilaya: wilaya,
        baladia: baladia,
        avatar_url: avatarUrl,
        bio: bio,
      };

      if (initialProfile.role === "PROVIDER") {
        updateData.provider_type = providerType;
        updateData.specialty = specialty;
      }

      await updateUserProfile(updateData);
      setSuccess(true);
      router.refresh();
      // Scroll to top to see success banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ التغييرات";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3 justify-start">
            <Sparkles className="text-primary animate-pulse" size={28} />
            <span>تعديل الملف الشخصي</span>
          </h1>
          <p className="text-muted-foreground mt-1">تحديث معلوماتك الشخصية والمهنية لتظهر بشكل جذاب للمستخدمين.</p>
        </div>
        <div className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl border border-primary/20 self-start md:self-auto">
          {initialProfile.role === "PROVIDER" ? "حساب مقدم خدمات" : "حساب زبون"}
        </div>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-4 rounded-xl flex items-center gap-3 justify-start shadow-sm"
        >
          <CheckCircle className="text-emerald-500 shrink-0" size={24} />
          <span className="font-bold">تم حفظ التعديلات بنجاح!</span>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 text-red-800 p-4 rounded-xl flex items-center gap-3 justify-start shadow-sm"
        >
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <span className="font-bold">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Right Side: Avatar Selection & Bio */}
        <div className="space-y-8">
          <Card className="border-2 border-border shadow-brutal bg-card overflow-hidden">
            <CardHeader className="bg-secondary border-b border-border">
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <User size={18} />
                <span>الصورة الشخصية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full border-4 border-primary shadow-lg overflow-hidden relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={avatarUrl} 
                    alt="avatar" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">اختر أحد الصور الجاهزة أو ضع رابط صورتك أدناه</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(avatar)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      avatarUrl === avatar ? "border-primary scale-95 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground block">أو رابط صورة مخصص:</label>
                <Input 
                  type="url" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg"
                  className="h-10 text-left bg-secondary border-border focus:bg-card"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Left Side: General Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-2 border-border shadow-brutal bg-card">
            <CardHeader className="bg-secondary border-b border-border">
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <FileText size={18} />
                <span>المعلومات الشخصية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <User size={16} className="text-primary" />
                    <span>الاسم الكامل</span>
                  </label>
                  <Input 
                    type="text" 
                    required 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="مثال: محمد علي"
                    className="h-12 bg-secondary border-border focus:bg-card text-right"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Phone size={16} className="text-primary" />
                    <span>رقم الهاتف</span>
                  </label>
                  <Input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="مثال: 0550123456"
                    className="h-12 bg-secondary border-border focus:bg-card text-left"
                  />
                </div>

                {/* Wilaya Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <MapPin size={16} className="text-primary" />
                    <span>الولاية</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(parseInt(e.target.value))}
                    className="flex h-12 w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                  >
                    {WILAYAS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Baladia */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <MapPin size={16} className="text-primary" />
                    <span>البلدية</span>
                  </label>
                  <Input
                    type="text"
                    value={baladia}
                    onChange={(e) => setBaladia(e.target.value)}
                    placeholder="مثال: بئر مراد رايس"
                    className="h-12 bg-secondary border-border focus:bg-card text-right"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText size={16} className="text-primary" />
                  <span>نبذة تعريفية</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة قصيرة عن نفسك، خبرتك، أو خدماتك..."
                  rows={4}
                  className="flex w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-right resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider Specific Section */}
          {initialProfile.role === "PROVIDER" && (
            <Card className="border-2 border-border shadow-brutal bg-card">
              <CardHeader className="bg-secondary border-b border-border">
                <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <Briefcase size={18} />
                  <span>تفاصيل العمل ومجال الخدمة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Provider Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">نوع المقدم</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setProviderType("INDIVIDUAL")}
                        className={`h-12 rounded-xl font-bold border-2 transition-all ${
                          providerType === "INDIVIDUAL" 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "border-border text-muted-foreground hover:bg-primary/5"
                        }`}
                      >
                        حرفي / فردي
                      </button>
                      <button
                        type="button"
                        onClick={() => setProviderType("COMPANY")}
                        className={`h-12 rounded-xl font-bold border-2 transition-all ${
                          providerType === "COMPANY" 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "border-border text-muted-foreground hover:bg-primary/5"
                        }`}
                      >
                        مؤسسة / شركة
                      </button>
                    </div>
                  </div>

                  {/* Specialty */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">التخصص الرئيسي</label>
                    <Input 
                      type="text" 
                      value={specialty} 
                      onChange={(e) => setSpecialty(e.target.value)} 
                      placeholder="مثال: دهان، سباك، مقاولات عامة"
                      className="h-12 bg-secondary border-border focus:bg-card text-right"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              variant="brutal"
              size="lg"
              className="font-bold flex items-center gap-2"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
