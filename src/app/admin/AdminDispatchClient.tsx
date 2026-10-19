"use client";

import { useState, useEffect, useRef, useTransition, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Droplets,
  Zap,
  PaintBucket,
  Hammer,
  Layers,
  Wrench,
  Truck,
  Package,
  HardHat,
  Thermometer,
  Shovel,
  Clock,
  AlertCircle,
  Send,
  CheckCircle2,
  MapPin,
  User,
  ChevronDown,
  Loader2,
  Inbox,
  Star,
  Shield,
  RefreshCw,
  Briefcase,
  X,
} from "lucide-react";
import Image from "next/image";
import { WILAYAS, getWilayaName } from "@/lib/wilayas";
import {
  createDispatchBooking,
  getDispatchHistory,
  getAvailableProviders,
  getPendingRequests,
  assignRequestToProvider,
  declineRequest,
  cancelDispatch,
} from "@/lib/db";
import { useAdminGuard } from "@/lib/use-admin";

// ── Service Catalogue ──────────────────────────────────────────────────────────
const SERVICES = [
  { id: "masonry",     icon: Building2,   label: "بناء وتشييد",    grad: "from-amber-500 to-orange-600" },
  { id: "plumbing",    icon: Droplets,    label: "سباكة",           grad: "from-blue-500 to-cyan-600" },
  { id: "electricity", icon: Zap,         label: "كهرباء",          grad: "from-yellow-400 to-amber-500" },
  { id: "painting",    icon: PaintBucket, label: "دهان وطلاء",    grad: "from-pink-500 to-rose-600" },
  { id: "carpentry",   icon: Hammer,      label: "نجارة",           grad: "from-green-500 to-emerald-600" },
  { id: "tiling",      icon: Layers,      label: "تبليط وسيراميك", grad: "from-violet-500 to-purple-600" },
  { id: "ironwork",    icon: Wrench,      label: "حدادة",           grad: "from-slate-400 to-slate-600" },
  { id: "excavation",  icon: Shovel,      label: "حفر وترابية",   grad: "from-amber-700 to-amber-900" },
  { id: "transport",   icon: Truck,       label: "نقل ومواد",      grad: "from-sky-500 to-blue-600" },
  { id: "materials",   icon: Package,     label: "توريد مواد",     grad: "from-teal-500 to-green-600" },
  { id: "safety",      icon: HardHat,     label: "إشراف وسلامة",  grad: "from-orange-400 to-red-500" },
  { id: "hvac",        icon: Thermometer, label: "تكييف وتدفئة",  grad: "from-cyan-400 to-teal-500" },
];

const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

const URGENCY = [
  { id: "normal", icon: Clock,       label: "عادي",       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/40" },
  { id: "urgent", icon: AlertCircle, label: "عاجل",       color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/40" },
  { id: "asap",   icon: Zap,         label: "فوري جداً",  color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/40" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DISPATCHED:  { label: "تم الإرسال",  color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "text-yellow-400",       bg: "bg-yellow-400/10" },
  COMPLETED:   { label: "مكتمل",       color: "text-emerald-400",      bg: "bg-emerald-400/10" },
  CANCELLED:   { label: "ملغى",        color: "text-red-400",          bg: "bg-red-400/10" },
};

// Types inferred from DB functions
type Provider = Awaited<ReturnType<typeof getAvailableProviders>>[number];
type HistoryItem = Awaited<ReturnType<typeof getDispatchHistory>>[number];

export function AdminDispatchClient() {
  const { isAdmin, loading: guardLoading } = useAdminGuard();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Form state
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker]   = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState("normal");
  const [selectedWilaya, setSelectedWilaya]   = useState<number | "">("");
  const [workerFilter, setWorkerFilter]       = useState("");
  const [notes, setNotes]                     = useState("");

  // Data from DB
  const [providers, setProviders]     = useState<Provider[]>([]);
  const [history, setHistory]         = useState<HistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // UI state
  const [isPending, startTransition] = useTransition();
  const [sent, setSent]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'requests'>('dispatch');
  const [pendingRequests, setPendingRequests] = useState<{
    id: string; service_type: string; urgency: string;
    wilaya: number; notes: string | null; created_at: string;
    client: { name: string; phone: string | null } | null;
  }[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [targetRequest, setTargetRequest] = useState<{
    id: string; service_type: string; urgency: string; wilaya: number;
    notes: string | null; created_at: string;
    client: { name: string; phone: string | null } | null;
  } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    requestId: string; providerId: string; providerName: string;
    serviceType: string; clientName: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pendingResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingResetRef.current) clearTimeout(pendingResetRef.current);
    };
  }, []);

  // Load providers + history on mount and after every dispatch
  useEffect(() => {
    if (!isAdmin) return;
    const loadData = async () => {
      setLoadingData(true);
      setDataError(null);
      try {
        const [prov, hist] = await Promise.all([
          getAvailableProviders(
            selectedService ?? undefined,
            selectedWilaya !== "" ? Number(selectedWilaya) : undefined,
          ),
          getDispatchHistory(40),
        ]);
        setProviders(prov);
        setHistory(hist);
      } catch (err) {
        // Keep the previous list visible, but say so — dispatching to a stale
        // provider list should not look like a freshly loaded one.
        console.error('[dispatch] failed to refresh providers/history', err);
        setDataError("تعذّر تحديث قائمة العمال. البيانات المعروضة قد تكون قديمة.");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [mounted, isAdmin, selectedService, selectedWilaya, refreshKey]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    getPendingRequests()
      .then((rows) => {
        if (cancelled) return;
        setPendingRequests(rows);
        setRequestsError(null);
      })
      .catch((err) => {
        console.error('[dispatch] failed to load pending requests', err);
        // Never leave the list empty on failure: "no pending requests" would
        // be a false, dangerous claim while requests are still waiting.
        if (!cancelled) setRequestsError("تعذّر تحميل الطلبات المعلقة. حاول تحديث الصفحة.");
      });
    return () => { cancelled = true; };
  }, [mounted, isAdmin, refreshKey]);

  const filteredProviders = providers.filter((p) => {
    const matchSearch = !workerFilter || p.name.includes(workerFilter);
    return matchSearch;
  });

  const canSend = selectedService && selectedWorker && selectedWilaya !== "";

  if (guardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const handleSend = () => {
    if (!canSend) return;
    setError(null);

    const workerName =
      providers.find(p => p.id === selectedWorker)?.name ?? '';

    startTransition(async () => {
      try {
        await createDispatchBooking({
          provider_id:  selectedWorker,
          service_type: selectedService!,
          urgency:      selectedUrgency,
          wilaya:       Number(selectedWilaya),
          notes:        notes.trim() || undefined,
          request_id:   targetRequest?.id,
        });

        // Refresh history & providers
        const [prov, hist] = await Promise.all([
          getAvailableProviders(selectedService ?? undefined, Number(selectedWilaya) || undefined),
          getDispatchHistory(40),
        ]);
        setProviders(prov);
        setHistory(hist);

        setSent(true);
        setSuccessMessage(
          targetRequest
            ? `تم إرسال طلب العميل إلى ${workerName}`
            : `تم إرسال أمر العمل إلى ${workerName}`
        );
        const timer = setTimeout(() => {
          setSent(false);
          setSuccessMessage(null);
          setSelectedService(null);
          setSelectedWorker(null);
          setSelectedUrgency("normal");
          setSelectedWilaya("");
          setNotes("");
          setWorkerFilter("");
          setTargetRequest(null);
        }, 3000);
        pendingResetRef.current = timer;
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error && err.message.includes("no longer pending")
            ? "سبق تعيين هذا الطلب من طرف آخر. تم تحديث القائمة."
            : "حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً."
        );
        setRefreshKey(k => k + 1);
      }
    });
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-8">
        <div className="absolute inset-0 diagonal-bg opacity-5" />
        <div className="relative z-10 flex items-start justify-between">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loadingData}
            className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} />
            تحديث
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">لوحة الإدارة</p>
            <h1 className="text-3xl font-black text-[var(--foreground)]">إرسال أوامر العمل</h1>
            <p className="text-[var(--muted)] mt-2 text-sm leading-relaxed">
              اختر الخدمة المطلوبة ثم حدد العامل المناسب وأرسل له أمر العمل مباشرة
            </p>
          </div>
        </div>
      </div>

      {/* Shared feedback — visible in BOTH tabs so auto-assign failures are never silent */}
      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 text-sm text-center font-bold">
          {error}
        </div>
      )}
      {successMessage && (
        <div role="status" className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 text-sm text-center font-bold">
          {successMessage}
        </div>
      )}

      <div className="flex gap-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5" dir="rtl">
        <button
          onClick={() => { setActiveTab('dispatch'); setError(null); }}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-black text-sm transition-all",
            activeTab === 'dispatch'
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          ].join(" ")}
        >
          <Send size={16} />
          إرسال أمر عمل
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setError(null); }}
          className={[
            "flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-black text-sm transition-all relative",
            activeTab === 'requests'
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          ].join(" ")}
        >
          <Inbox size={16} />
          طلبات العملاء
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'dispatch' && (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── Left: Dispatch Form ───────────────────────────────── */}
        <div className="xl:col-span-2 space-y-8">

          {dataError && (
            <div role="alert" className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-600 dark:text-amber-400">
              <AlertCircle size={16} />
              {dataError}
            </div>
          )}

          {/* Step 1 — Service */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-black text-sm">١</div>
              <h2 className="font-black text-[var(--foreground)]">اختر نوع الخدمة</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {SERVICES.map((svc) => {
                const Icon = svc.icon;
                const isActive = selectedService === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setSelectedService(isActive ? null : svc.id);
                      setSelectedWorker(null);
                    }}
                    className={[
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-xs",
                      isActive
                        ? `bg-gradient-to-br ${svc.grad} border-transparent text-white shadow-lg`
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <Icon size={22} />
                    <span className="text-center leading-tight">{svc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Urgency + Wilaya */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-black text-sm">٢</div>
              <h2 className="font-black text-[var(--foreground)]">الاستعجال والموقع</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Urgency */}
              <div>
                <p className="text-xs text-[var(--muted)] mb-3 font-bold">مستوى الأولوية</p>
                <div className="flex gap-2">
                  {URGENCY.map((u) => {
                    const Icon = u.icon;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUrgency(u.id)}
                        className={[
                          "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all",
                          selectedUrgency === u.id
                            ? `${u.bg} ${u.border} ${u.color} scale-105 shadow-md`
                            : "border-[var(--border)] text-[var(--muted)]",
                        ].join(" ")}
                      >
                        <Icon size={16} />
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wilaya */}
              <div>
                <p className="text-xs text-[var(--muted)] mb-3 font-bold">الولاية</p>
                <div className="relative">
                  <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <select
                    value={selectedWilaya}
                    onChange={(e) => {
                      setSelectedWilaya(e.target.value === "" ? "" : Number(e.target.value));
                      setSelectedWorker(null);
                    }}
                    className="w-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-xl py-3 pr-9 pl-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  >
                    <option value="">-- اختر الولاية --</option>
                    {WILAYAS.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs text-[var(--muted)] mb-3 font-bold">ملاحظات اختيارية</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="أضف تفاصيل أو تعليمات للعامل..."
                className="w-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Step 3 — Worker */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-black text-sm">٣</div>
                <h2 className="font-black text-[var(--foreground)]">اختر العامل</h2>
                {providers.length > 0 && (
                  <span className="text-xs text-[var(--muted)] font-medium">{providers.length} متاح</span>
                )}
              </div>
              <div className="relative">
                <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={workerFilter}
                  onChange={(e) => setWorkerFilter(e.target.value)}
                  className="bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-xl py-2 pr-8 pl-3 text-sm outline-none w-36 focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </div>

            {loadingData ? (
              <div className="py-8 flex flex-col items-center gap-3 text-[var(--muted)]">
                <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                <span className="text-sm">جارٍ تحميل العمال...</span>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)] flex items-center justify-center">
                  <User size={24} className="text-[var(--muted)]" />
                </div>
                <p className="text-[var(--muted)] text-sm font-medium">
                  {providers.length === 0
                    ? "لا يوجد مزودو خدمة مسجلون بعد"
                    : "لا يوجد عمال متطابقون مع بحثك"}
                </p>
                <p className="text-[var(--muted)] text-xs opacity-70">
                  {providers.length === 0
                    ? "سيظهر هنا العمال المسجلون كمزودي خدمة"
                    : "جرّب تغيير كلمة البحث"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProviders.map((worker) => {
                  const isSelected = selectedWorker === worker.id;
                  const svcInfo = worker.specialty ? SERVICE_MAP[worker.specialty] : null;
                  const SpecIcon = svcInfo?.icon ?? User;
                  return (
                    <button
                      key={worker.id}
                      onClick={() => setSelectedWorker(isSelected ? null : worker.id)}
                      disabled={!worker.available}
                      className={[
                        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-right",
                        !worker.available
                          ? "opacity-40 cursor-not-allowed border-[var(--border)]"
                          : isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                          : "border-[var(--border)] hover:border-[var(--primary)]/40",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[var(--secondary)] flex items-center justify-center font-black text-[var(--primary)] border border-[var(--border)] overflow-hidden">
                          {worker.avatar
                            ? <Image src={worker.avatar} alt={worker.name} width={44} height={44} className="w-full h-full object-cover rounded-full" />
                            : <span>{worker.name[0]}</span>
                          }
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--foreground)]">{worker.name}</span>
                            {worker.verified && <Shield size={13} className="text-[var(--primary)]" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                            {worker.wilaya && (
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {getWilayaName(worker.wilaya)}
                              </span>
                            )}
                            {worker.activeJobs > 0 && (
                              <span className="flex items-center gap-1 text-orange-400">
                                <Briefcase size={10} />
                                {worker.activeJobs} مهمة نشطة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {svcInfo && (
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${svcInfo.grad}`}>
                            <SpecIcon size={14} className="text-white" />
                          </div>
                        )}
                        {worker.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            {worker.rating.toFixed(1)}
                          </div>
                        )}
                        {isSelected && <CheckCircle2 size={18} className="text-[var(--primary)]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dispatching an existing customer request */}
          {targetRequest && (
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="text-sm">
                <p className="font-black text-[var(--foreground)]">
                 dispatching طلب عميل — {SERVICE_MAP[targetRequest.service_type]?.label ?? targetRequest.service_type}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  سيتم تحديث نفس الطلب وإغلاقه، لن يتم إنشاء طلب جديد.
                </p>
              </div>
              <button
                onClick={() => setTargetRequest(null)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-bold shrink-0"
              >
                إلغاء الربط
              </button>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!canSend || isPending || sent}
            className={[
              "w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-base transition-all",
              !canSend ? "opacity-40 cursor-not-allowed bg-[var(--secondary)] text-[var(--muted)] border border-[var(--border)]" :
              sent      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
              "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/25 hover:opacity-90",
            ].join(" ")}
          >
            {isPending    ? <Loader2 size={22} className="animate-spin" /> :
             sent         ? <><CheckCircle2 size={22} /> تم الإرسال بنجاح!</> :
             <><Send size={22} /> إرسال أمر العمل</>}
          </button>
        </div>

        {/* ── Right: Dispatch History ────────────────────────────── */}
        <div className="space-y-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-2xl px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <Inbox size={20} className="text-[var(--primary)]" />
              <span className="font-black text-[var(--foreground)]">سجل الإرسال</span>
              <span className="bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
            <ChevronDown size={18} className={`text-[var(--muted)] transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {history.length === 0 && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center text-[var(--muted)] text-sm">
                    لا توجد أوامر عمل بعد
                  </div>
                )}
                {history.map((item) => {
                  const svc = SERVICE_MAP[item.service_type];
                  const st  = STATUS_CONFIG[item.status];
                  if (!svc) return null;
                  const Icon = svc.icon;
                  return (
                    <div key={item.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${st?.bg} ${st?.color}`}>
                          {st?.label ?? item.status}
                        </div>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${svc.grad}`}>
                          <Icon size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[var(--foreground)]">{svc.label}</div>
                        <div className="text-xs text-[var(--muted)] mt-0.5 flex items-center justify-end gap-2">
                          {item.provider
                            ? <span className="flex items-center gap-1">
                                {item.provider.verified && <Shield size={10} className="text-[var(--primary)]" />}
                                {item.provider.name}
                              </span>
                            : <span>عامل غير محدد</span>
                          }
                          {item.wilaya > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {getWilayaName(item.wilaya)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--muted)] flex flex-col items-end gap-1">
                        <span>
                          {mounted ? new Date(item.created_at).toLocaleDateString("ar-DZ", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          }) : "..."}
                        </span>
                        {(item.status === "DISPATCHED" || item.status === "IN_PROGRESS") && (
                          <button
                            onClick={async () => {
                              setError(null);
                              try {
                                await cancelDispatch(item.id);
                                setRefreshKey(k => k + 1);
                              } catch {
                                setError("حدث خطأ أثناء إلغاء أمر العمل");
                              }
                            }}
                            className="text-red-400 hover:underline font-bold"
                          >
                            إلغاء الأمر
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {activeTab === 'requests' && (
      <div className="space-y-4">
        {requestsError ? (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <AlertCircle size={36} className="mx-auto text-red-500 mb-3" />
            <h3 className="text-lg font-black text-[var(--foreground)] mb-2">{requestsError}</h3>
            <p className="text-sm text-[var(--muted)]">لا يمكن عرض حالة الطلبات الآن. لم يتم تأكيد خلو القائمة.</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
            <Inbox size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-40" />
            <h3 className="text-lg font-black text-[var(--foreground)] mb-2">لا توجد طلبات معلقة</h3>
            <p className="text-sm text-[var(--muted)]">عندما يرسل العملاء طلبات خدمات من صفحة الحرفيين، ستظهر هنا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const svc = SERVICES.find(s => s.id === req.service_type);
              const urgency = URGENCY.find(u => u.id === req.urgency);
              const UrgencyIcon = urgency?.icon ?? Clock;
              return (
                <div key={req.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {svc && (
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${svc.grad}`}>
                          <svc.icon size={18} className="text-white" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[var(--foreground)]">{svc?.label ?? req.service_type}</div>
                        {req.client && (
                          <div className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-2">
                            <span>{req.client.name}</span>
                            {req.client.phone && (
                              <a
                                href={`tel:${req.client.phone}`}
                                dir="ltr"
                                className="text-[var(--primary)] hover:underline font-bold"
                              >
                                {req.client.phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${urgency?.bg ?? 'bg-blue-400/10'} ${urgency?.color ?? 'text-blue-400'}`}>
                      <UrgencyIcon size={12} />
                      {urgency?.label ?? 'عادي'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {getWilayaName(req.wilaya)}
                    </span>
                    <span>
                      {mounted ? new Date(req.created_at).toLocaleDateString("ar-DZ", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      }) : "..."}
                    </span>
                  </div>

                  {/* Customer notes get their own full-width line so long Arabic
                      text is never clipped mid-word. */}
                  {req.notes && (
                    <p className="text-xs text-[var(--muted)] bg-[var(--secondary)] rounded-lg p-3 leading-relaxed whitespace-pre-wrap break-words">
                      {req.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      onClick={() => {
                        setActiveTab('dispatch');
                        setError(null);
                        if (svc) setSelectedService(svc.id);
                        setSelectedUrgency(req.urgency);
                        setSelectedWilaya(req.wilaya);
                        setNotes(req.notes ?? "");
                        setTargetRequest(req);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm hover:opacity-90 transition-all"
                    >
                      <Send size={14} />
                      إرسال إلى عامل
                    </button>
                    <button
                      disabled={assigning === req.id}
                      onClick={async () => {
                        setAssigning(req.id);
                        setError(null);
                        try {
                          const providers = await getAvailableProviders(req.service_type, req.wilaya);
                          const available = providers.find(p => p.available);
                          if (!available) {
                            setError("لا يوجد عمال متاحون لهذه الخدمة");
                            return;
                          }
                          // Ask before assigning — the worker is notified immediately
                          // and there is no undo from the worker side.
                          setPendingConfirm({
                            requestId: req.id,
                            providerId: available.id,
                            providerName: available.name,
                            serviceType: req.service_type,
                            clientName: req.client?.name ?? '',
                          });
                        } catch {
                          setError("حدث خطأ أثناء جلب العمال المتاحين");
                        } finally {
                          setAssigning(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--border)] text-[var(--muted)] font-bold text-sm hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)] transition-all disabled:opacity-50"
                    >
                      {assigning === req.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      تعيين تلقائي
                    </button>
                    <button
                      disabled={assigning === req.id}
                      onClick={async () => {
                        setAssigning(req.id);
                        setError(null);
                        try {
                          await declineRequest(req.id);
                          setRefreshKey(k => k + 1);
                        } catch {
                          setError("حدث خطأ أثناء رفض الطلب");
                        } finally {
                          setAssigning(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <X size={14} />
                      رفض
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* ── Auto-assign confirmation ─────────────────────────────── */}
      <AnimatePresence>
        {pendingConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setPendingConfirm(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="تأكيد التعيين"
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <h3 className="font-black text-[var(--foreground)] text-lg">تأكيد تعيين العامل</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                سيتم إشعار <span className="font-bold text-[var(--foreground)]">{pendingConfirm.providerName}</span> فوراً
                ويعمل على طلب <span className="font-bold text-[var(--foreground)]">{SERVICE_MAP[pendingConfirm.serviceType]?.label ?? pendingConfirm.serviceType}</span>
                {pendingConfirm.clientName && <> للعميل {pendingConfirm.clientName}</>}. هل تريد المتابعة؟
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    const target = pendingConfirm;
                    setPendingConfirm(null);
                    setAssigning(target.requestId);
                    setError(null);
                    try {
                      await assignRequestToProvider(target.requestId, target.providerId);
                      setSuccessMessage(`تم تعيين الطلب إلى ${target.providerName}`);
                      setRefreshKey(k => k + 1);
                    } catch (err) {
                      console.error(err);
                      setError(
                        err instanceof Error && err.message.includes("سبق تعيين")
                          ? err.message
                          : "حدث خطأ أثناء التعيين"
                      );
                      setRefreshKey(k => k + 1);
                    } finally {
                      setAssigning(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm hover:opacity-90 transition-all"
                >
                  تأكيد الإرسال
                </button>
                <button
                  onClick={() => setPendingConfirm(null)}
                  className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--muted)] font-bold text-sm hover:bg-[var(--secondary)] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
