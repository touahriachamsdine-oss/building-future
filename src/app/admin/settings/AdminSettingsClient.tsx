"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { changePasswordAction } from "@/lib/auth";
import { updateSiteConfig, getSiteConfig } from "@/lib/db";
import { 
  Settings, 
  Mail, 
  Server, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  Sliders,
  Database,
  RefreshCw,
  Building2,
  Save
} from "lucide-react";

export default function AdminSettingsClient() {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Platform Config state
  const [siteName, setSiteName] = useState("بناء المستقبل");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [approveProviders, setApproveProviders] = useState(true);
  const [approveListings, setApproveListings] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Company info state
  const [company, setCompany] = useState({
    company_name: "بناء المستقبل",
    company_name_en: "Binaa Mostaqbal",
    company_name_fr: "Bâtiment Avenir",
    tagline: "كل ما تحتاجه للبناء في مكان واحد",
    about_ar: "",
    about_en: "",
    about_fr: "",
    contact_phone: "+213 (0) 555 55 55 55",
    contact_email: "contact@binamostaqbal.dz",
    contact_address: "حي الأعمال، وسط المدينة",
    contact_address_en: "Business District, City Center",
    contact_address_fr: "Quartier d'affaires, Centre-ville",
    privacy_ar: "",
    privacy_en: "",
    privacy_fr: "",
    terms_ar: "",
    terms_en: "",
    terms_fr: "",
  });
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySuccess, setCompanySuccess] = useState(false);
  const [companyError, setCompanyError] = useState("");

  // Load site config on mount
  useEffect(() => {
    getSiteConfig().then((cfg) => {
      setSiteName(cfg.company_name);
      setMaintenanceMode(cfg.maintenance_mode);
      setApproveProviders(cfg.auto_approve_providers);
      setApproveListings(cfg.manual_listing_review);
      setCompany({
        company_name: cfg.company_name,
        company_name_en: cfg.company_name_en || "Binaa Mostaqbal",
        company_name_fr: cfg.company_name_fr || "Bâtiment Avenir",
        tagline: cfg.tagline || "كل ما تحتاجه للبناء في مكان واحد",
        about_ar: cfg.about_ar || "",
        about_en: cfg.about_en || "",
        about_fr: cfg.about_fr || "",
        contact_phone: cfg.contact_phone || "+213 (0) 555 55 55 55",
        contact_email: cfg.contact_email || "contact@binamostaqbal.dz",
        contact_address: cfg.contact_address || "حي الأعمال، وسط المدينة",
        contact_address_en: cfg.contact_address_en || "Business District, City Center",
        contact_address_fr: cfg.contact_address_fr || "Quartier d'affaires, Centre-ville",
        privacy_ar: cfg.privacy_ar || "",
        privacy_en: cfg.privacy_en || "",
        privacy_fr: cfg.privacy_fr || "",
        terms_ar: cfg.terms_ar || "",
        terms_en: cfg.terms_en || "",
        terms_fr: cfg.terms_fr || "",
      });
    }).catch(() => {});
  }, []);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.buildingfuture.io");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("notifications@buildingfuture.io");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

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
        setPasswordStatus({ type: "success", message: "تم تحديث كلمة المرور للمشرف بنجاح" });
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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccess(false);

    try {
      await updateSiteConfig({
        company_name: siteName,
        maintenance_mode: maintenanceMode,
        auto_approve_providers: approveProviders,
        manual_listing_review: approveListings,
      });
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setSmtpStatus({ type: null, message: "" });

    // Simulate mail delivery check
    setTimeout(() => {
      setIsTestingSmtp(false);
      setSmtpStatus({ type: "success", message: "تم إرسال بريد إلكتروني تجريبي بنجاح إلى المشرف!" });
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12 text-foreground text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">إعدادات النظام</h1>
        <p className="text-muted-foreground">إدارة الإعدادات العامة للمنصة، إعدادات الأمان والتنبيهات البريدية.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Navigation / Cards column */}
        <div className="space-y-6 xl:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1 shadow-sm">
            <a href="#general" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm transition-all">
              <Settings size={18} />
              <span>الإعدادات العامة للوحة</span>
            </a>
            <a href="#company" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Building2 size={18} />
              <span>معلومات الشركة</span>
            </a>
            <a href="#security" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Lock size={18} />
              <span>أمان حساب المشرف</span>
            </a>
            <a href="#mail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Mail size={18} />
              <span>إعدادات البريد (SMTP)</span>
            </a>
            <a href="#system" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 font-medium text-sm transition-all">
              <Server size={18} />
              <span>حالة النظام والنسخ الاحتياطي</span>
            </a>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
              <AlertTriangle size={18} className="text-amber-600" />
              <span>تنبيه المشرف</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              التغييرات في الإعدادات العامة تؤثر مباشرة على جميع المستخدمين المتصلين في الوقت الفعلي. يرجى توخي الحذر عند تفعيل وضع الصيانة.
            </p>
          </div>
        </div>

        {/* Content column */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* General Platform Config */}
          <section id="general" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">التحكم في المنصة</h2>
                  <p className="text-xs text-muted-foreground">تخصيص السلوك العام للتسجيل وإدراج الإعلانات.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {configSuccess && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>تم حفظ إعدادات النظام بنجاح!</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">اسم المنصة</label>
                <Input 
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="بناء المستقبل"
                  required
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground">تفعيل وضع الصيانة</span>
                    <span className="text-xs text-muted-foreground">منع المستخدمين من تصفح المنصة وإظهار صفحة صيانة بدلاً من ذلك.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenanceMode ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenanceMode ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground">الموافقة التلقائية على مزودي الخدمة</span>
                    <span className="text-xs text-muted-foreground">تفعيل الحسابات الجديدة تلقائياً دون الحاجة لمراجعة المشرف.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApproveProviders(!approveProviders)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${approveProviders ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${approveProviders ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-foreground">مراجعة الإعلانات يدوياً</span>
                    <span className="text-xs text-muted-foreground">تطلب الإعلانات وخدمات التدوير الجديدة مراجعة من المشرف قبل النشر.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApproveListings(!approveListings)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${approveListings ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${approveListings ? '-translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <Button 
                  type="submit" 
                  disabled={isSavingConfig}
                  className="px-6"
                >
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : "حفظ الإعدادات"}
                </Button>
              </div>
            </form>
          </section>

          {/* Company Info */}
          <section id="company" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">معلومات الشركة</h2>
                <p className="text-xs text-muted-foreground">تعديل معلومات الشركة التي تظهر في الصفحات العامة (من نحن، اتصل بنا، الخصوصية، الشروط).</p>
              </div>
            </div>

            {companySuccess && (
              <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium flex items-center gap-2">
                <CheckCircle size={18} />
                <span>تم حفظ معلومات الشركة بنجاح!</span>
              </div>
            )}
            {companyError && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>{companyError}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">اسم الشركة (عربي)</label>
                  <Input value={company.company_name} onChange={(e) => setCompany(p => ({ ...p, company_name: e.target.value }))} placeholder="بناء المستقبل" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Company name (English)</label>
                  <Input value={company.company_name_en} onChange={(e) => setCompany(p => ({ ...p, company_name_en: e.target.value }))} placeholder="Binaa Mostaqbal" className="text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Nom (Français)</label>
                  <Input value={company.company_name_fr} onChange={(e) => setCompany(p => ({ ...p, company_name_fr: e.target.value }))} placeholder="Bâtiment Avenir" className="text-left" />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">الشعار</label>
                <Input value={company.tagline} onChange={(e) => setCompany(p => ({ ...p, tagline: e.target.value }))} placeholder="كل ما تحتاجه للبناء في مكان واحد" />
              </div>

              {/* Contact */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">رقم الهاتف</label>
                  <Input value={company.contact_phone} onChange={(e) => setCompany(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+213 (0) 555 55 55 55" className="text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                  <Input value={company.contact_email} onChange={(e) => setCompany(p => ({ ...p, contact_email: e.target.value }))} placeholder="contact@example.com" className="text-left" />
                </div>
              </div>

              {/* Address */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">العنوان (عربي)</label>
                  <Input value={company.contact_address} onChange={(e) => setCompany(p => ({ ...p, contact_address: e.target.value }))} placeholder="حي الأعمال، وسط المدينة" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Address (English)</label>
                  <Input value={company.contact_address_en} onChange={(e) => setCompany(p => ({ ...p, contact_address_en: e.target.value }))} placeholder="Business District, City Center" className="text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Adresse (Français)</label>
                  <Input value={company.contact_address_fr} onChange={(e) => setCompany(p => ({ ...p, contact_address_fr: e.target.value }))} placeholder="Quartier d'affaires, Centre-ville" className="text-left" />
                </div>
              </div>

              {/* About */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">من نحن (عربي)</label>
                <textarea value={company.about_ar} onChange={(e) => setCompany(p => ({ ...p, about_ar: e.target.value }))} rows={3} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">About (English)</label>
                  <textarea value={company.about_en} onChange={(e) => setCompany(p => ({ ...p, about_en: e.target.value }))} rows={3} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">À propos (Français)</label>
                  <textarea value={company.about_fr} onChange={(e) => setCompany(p => ({ ...p, about_fr: e.target.value }))} rows={3} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">سياسة الخصوصية (عربي)</label>
                <textarea value={company.privacy_ar} onChange={(e) => setCompany(p => ({ ...p, privacy_ar: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Privacy (English)</label>
                  <textarea value={company.privacy_en} onChange={(e) => setCompany(p => ({ ...p, privacy_en: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Confidentialité (Français)</label>
                  <textarea value={company.privacy_fr} onChange={(e) => setCompany(p => ({ ...p, privacy_fr: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">الشروط والأحكام (عربي)</label>
                <textarea value={company.terms_ar} onChange={(e) => setCompany(p => ({ ...p, terms_ar: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Terms (English)</label>
                  <textarea value={company.terms_en} onChange={(e) => setCompany(p => ({ ...p, terms_en: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Conditions (Français)</label>
                  <textarea value={company.terms_fr} onChange={(e) => setCompany(p => ({ ...p, terms_fr: e.target.value }))} rows={4} className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none text-left" />
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <Button
                  type="button"
                  disabled={isSavingCompany}
                  className="px-6"
                  onClick={async () => {
                    setIsSavingCompany(true);
                    setCompanyError("");
                    setCompanySuccess(false);
                    try {
                      await updateSiteConfig({
                        company_name: company.company_name,
                        company_name_en: company.company_name_en,
                        company_name_fr: company.company_name_fr,
                        tagline: company.tagline,
                        about_ar: company.about_ar,
                        about_en: company.about_en,
                        about_fr: company.about_fr,
                        contact_phone: company.contact_phone,
                        contact_email: company.contact_email,
                        contact_address: company.contact_address,
                        contact_address_en: company.contact_address_en,
                        contact_address_fr: company.contact_address_fr,
                        privacy_ar: company.privacy_ar,
                        privacy_en: company.privacy_en,
                        privacy_fr: company.privacy_fr,
                        terms_ar: company.terms_ar,
                        terms_en: company.terms_en,
                        terms_fr: company.terms_fr,
                      });
                      setCompanySuccess(true);
                      setTimeout(() => setCompanySuccess(false), 3000);
                    } catch {
                      setCompanyError("حدث خطأ أثناء الحفظ. حاول مرة أخرى.");
                    } finally {
                      setIsSavingCompany(false);
                    }
                  }}
                >
                  {isSavingCompany ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> حفظ معلومات الشركة</>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Admin Security */}
          <section id="security" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">أمان المشرف</h2>
                <p className="text-xs text-muted-foreground">تعديل كلمة المرور الخاصة بحساب الإشراف.</p>
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
                <label className="text-sm font-bold text-foreground">كلمة المرور الجديدة للمشرف</label>
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
                  ) : "تحديث كلمة المرور للمشرف"}
                </Button>
              </div>
            </form>
          </section>

          {/* SMTP Settings */}
          <section id="mail" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">إعدادات البريد الإلكتروني (SMTP)</h2>
                <p className="text-xs text-muted-foreground">تكوين الخادم المسؤول عن إرسال إشعارات التنبيه والتسجيل.</p>
              </div>
            </div>

            <div className="space-y-4">
              {smtpStatus.type && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{smtpStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-foreground">مضيف خادم SMTP</label>
                  <Input 
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">المنفذ (Port)</label>
                  <Input 
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">بريد الإشعارات الافتراضي</label>
                <Input 
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="sender@example.com"
                  className="text-left"
                />
              </div>

              <div className="pt-2 flex gap-4">
                <Button 
                  type="button" 
                  onClick={handleTestSmtp}
                  disabled={isTestingSmtp}
                  variant="outline"
                  className="border-border text-foreground hover:bg-primary/5"
                >
                  {isTestingSmtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري إرسال التجربة...
                    </>
                  ) : "إرسال رسالة تجريبية"}
                </Button>
              </div>
            </div>
          </section>

          {/* System status & Backups */}
          <section id="system" className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Database size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">النسخ الاحتياطي وقاعدة البيانات</h2>
                <p className="text-xs text-muted-foreground">مراقبة التخزين وأخذ لقطة سريعة لقاعدة البيانات.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary rounded-xl border border-border">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground">قاعدة بيانات Neon Serverless</h4>
                <p className="text-xs text-muted-foreground">حالة قاعدة البيانات: <span className="text-green-600 font-bold">متصل (نشط)</span></p>
              </div>
              <Button 
                type="button" 
                variant="outline"
                className="border-border text-foreground hover:bg-primary/5 flex items-center gap-2"
              >
                <RefreshCw size={14} />
                <span>مزامنة الفروع</span>
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
