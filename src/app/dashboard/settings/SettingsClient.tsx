"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { changePasswordAction } from "@/lib/auth";
import { 
  Shield, 
  Bell, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  Globe
} from "lucide-react";

export default function SettingsClient() {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // General Notification Preferences (Interactive Mock UI)
  const [notifications, setNotifications] = useState({
    emails: true,
    messages: true,
    offers: false,
    updates: true,
  });

  // Account Preferences (Interactive Mock UI)
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("ar");

  // Deactivate dialog
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateSuccess, setDeactivateSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: "error", message: "الرجاء ملء جميع الحقول المطلوبة" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "كلمة المرور الجديدة وتأكيدها لا يتطابقان" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل" });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePasswordAction(currentPassword, newPassword);
      if (res.success) {
        setPasswordStatus({ type: "success", message: "تم تحديث كلمة المرور بنجاح" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({ type: "error", message: res.error || "حدث خطأ غير متوقع" });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "فشل الاتصال بالخادم" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    // Simulate API call to delete/deactivate
    setTimeout(() => {
      setIsDeactivating(false);
      setDeactivateSuccess(true);
      setTimeout(() => {
        // Clear cookies/redirect or similar, here we'll reload to go back to home/login
        window.location.href = "/login";
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">إعدادات الحساب</h1>
        <p className="text-muted-foreground">إدارة كلمة المرور والخصوصية وإشعارات حسابك.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
            <a href="#security" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm transition-all">
              <Shield size={18} />
              <span>الأمان وكلمة المرور</span>
            </a>
            <a href="#notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Bell size={18} />
              <span>التنبيهات والإشعارات</span>
            </a>
            <a href="#display" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Eye size={18} />
              <span>العرض واللغة</span>
            </a>
            <a href="#danger" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-all">
              <Trash2 size={18} />
              <span>إدارة الحساب</span>
            </a>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-sm">
              <Shield size={16} />
              <span>حماية إضافية</span>
            </div>
            <p className="text-xs text-primary/70 leading-relaxed">
              ننصح باستخدام كلمة مرور قوية تحتوي على أحرف وأرقام ورموز لضمان سلامة بياناتك.
            </p>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Security Card */}
          <section id="security" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">تغيير كلمة المرور</h2>
                <p className="text-xs text-muted-foreground">قم بتحديث كلمة المرور الخاصة بك بانتظام لحماية حسابك.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordStatus.type && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  passwordStatus.type === "success" 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {passwordStatus.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span className="font-medium">{passwordStatus.message}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">كلمة المرور الحالية</label>
                <Input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">كلمة المرور الجديدة</label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">تأكيد كلمة المرور الجديدة</label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-left"
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto px-6"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : "تحديث كلمة المرور"}
                </Button>
              </div>
            </form>
          </section>

          {/* Notifications Card */}
          <section id="notifications" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">إشعارات البريد الإلكتروني</h2>
                <p className="text-xs text-muted-foreground">اختر نوع الرسائل التي ترغب في تلقيها عبر البريد.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary hover:bg-primary/10 rounded-xl cursor-pointer transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-foreground">رسائل المحادثات</span>
                  <span className="text-xs text-muted-foreground">تلقي إشعار عند إرسال العملاء أو مزودي الخدمة رسالة جديدة لك.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifications.messages}
                  onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary hover:bg-primary/10 rounded-xl cursor-pointer transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-foreground">العروض والطلبات الجديدة</span>
                  <span className="text-xs text-muted-foreground">احصل على تنبيهات فورية حول عروض الأسعار والطلبات المتاحة.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifications.offers}
                  onChange={(e) => setNotifications({ ...notifications, offers: e.target.checked })}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-secondary hover:bg-primary/10 rounded-xl cursor-pointer transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-foreground">التحديثات الأمنية وتنبيهات الدخول</span>
                  <span className="text-xs text-muted-foreground">تلقي إشعارات عند تغيير كلمة المرور أو تسجيل الدخول من جهاز جديد.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                  disabled
                  className="w-5 h-5 accent-primary rounded cursor-not-allowed opacity-60"
                />
              </label>
            </div>
          </section>

          {/* Display & Language Card */}
          <section id="display" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">اللغة والمظهر</h2>
                <p className="text-xs text-muted-foreground">تخصيص لغة واجهة المنصة والمظهر العام.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">لغة المنصة</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-11 px-4 bg-secondary hover:bg-primary/10 dark:bg-card/5 rounded-xl border-none outline-none font-bold text-sm transition-colors text-right"
                >
                  <option value="ar">العربية (الافتراضية)</option>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">المظهر العام</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full h-11 px-4 bg-secondary hover:bg-primary/10 dark:bg-card/5 rounded-xl border-none outline-none font-bold text-sm transition-colors text-right"
                >
                  <option value="light">مظهر فاتح</option>
                  <option value="dark">مظهر داكن (قريباً)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Danger Zone Card */}
          <section id="danger" className="bg-red-50 rounded-2xl border border-red-100 p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-red-100">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-red-950">منطقة الخطر</h2>
                <p className="text-xs text-red-700/80">الإجراءات التالية لا يمكن التراجع عنها يرجى الحذر.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 p-4 rounded-xl border border-red-100/50">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-red-950">إلغاء تنشيط الحساب مؤقتاً</h4>
                <p className="text-xs text-red-700/80">سيتم إخفاء ملفك الشخصي وإعلاناتك مؤقتاً حتى تعود.</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDeactivateModal(true)}
                className="bg-transparent border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                إلغاء التنشيط
              </Button>
            </div>
          </section>

        </div>
      </div>

      {/* Deactivate/Delete Account Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl border-2 border-black max-w-md w-full p-8 space-y-6 text-right shadow-2xl relative animate-in zoom-in-95 duration-200" dir="rtl">
            <button 
              onClick={() => !isDeactivating && setShowDeactivateModal(false)}
              className="absolute top-4 left-4 text-muted-foreground hover:text-muted-foreground font-bold"
              disabled={isDeactivating}
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-foreground">هل أنت متأكد من إلغاء التنشيط؟</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                بمجرد تأكيد هذا الإجراء، سيتم حجب ملفك الشخصي ولن تتمكن من تلقي عروض جديدة حتى تقوم بتسجيل الدخول مرة أخرى.
              </p>
            </div>

            {deactivateSuccess ? (
              <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-center text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                <span>تم إلغاء تنشيط الحساب بنجاح. جاري توجيهك...</span>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button 
                  onClick={handleDeactivate} 
                  disabled={isDeactivating}
                  className="flex-1 bg-red-600 hover:bg-red-700 border-red-700 text-white"
                >
                  {isDeactivating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : "نعم، إلغاء التنشيط"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={isDeactivating}
                  className="flex-1 border-border hover:bg-primary/5 text-foreground"
                >
                  إلغاء
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
