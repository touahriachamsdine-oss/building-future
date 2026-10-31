"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hammer,
  Truck,
  Package,
  Wrench,
  Layers,
  Droplets,
  Zap,
  PaintBucket,
  Shovel,
  Building2,
  HardHat,
  Thermometer,
  Check,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  MessageSquare,
  Wallet,
  CalendarDays,
  MapPin,
  ChevronDown,
  Ban,
  RotateCcw,
  CreditCard,
  History,
  FileText,
} from "lucide-react";
import { useCallback } from "react";
import Image from "next/image";
import {
  createClientRequest,
  getClientBookings,
  respondToOffer,
  recordPayment,
  cancelClientRequest,
  resubmitRequest,
  getRequestTimeline,
} from "@/lib/db";
import { WILAYAS, getWilayaName } from "@/lib/wilayas";
import PaymentStep from "@/components/ui/PaymentStep";

// ── Service Catalogue ─────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "masonry",
    icon: Building2,
    label: "بناء وتشييد",
    subLabel: "Maçonnerie",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  {
    id: "plumbing",
    icon: Droplets,
    label: "سباكة",
    subLabel: "Plomberie",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
  },
  {
    id: "electricity",
    icon: Zap,
    label: "كهرباء",
    subLabel: "Électricité",
    color: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    glow: "shadow-yellow-400/20",
  },
  {
    id: "painting",
    icon: PaintBucket,
    label: "دهان وطلاء",
    subLabel: "Peinture",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
  },
  {
    id: "carpentry",
    icon: Hammer,
    label: "نجارة",
    subLabel: "Menuiserie",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
  },
  {
    id: "tiling",
    icon: Layers,
    label: "تبليط وسيراميك",
    subLabel: "Carrelage",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
  },
  {
    id: "ironwork",
    icon: Wrench,
    label: "حدادة",
    subLabel: "Ferronnerie",
    color: "from-slate-400 to-slate-600",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    glow: "shadow-slate-400/20",
  },
  {
    id: "excavation",
    icon: Shovel,
    label: "حفر وترابية",
    subLabel: "Terrassement",
    color: "from-brown-500 to-amber-800",
    bg: "bg-amber-900/10",
    border: "border-amber-700/30",
    glow: "shadow-amber-700/20",
  },
  {
    id: "transport",
    icon: Truck,
    label: "نقل ومواد",
    subLabel: "Transport",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/20",
  },
  {
    id: "materials",
    icon: Package,
    label: "توريد مواد",
    subLabel: "Matériaux",
    color: "from-teal-500 to-green-600",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "shadow-teal-500/20",
  },
  {
    id: "safety",
    icon: HardHat,
    label: "إشراف وسلامة",
    subLabel: "Sécurité",
    color: "from-orange-400 to-red-500",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    glow: "shadow-orange-400/20",
  },
  {
    id: "hvac",
    icon: Thermometer,
    label: "تكييف وتدفئة",
    subLabel: "Climatisation",
    color: "from-cyan-400 to-teal-500",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    glow: "shadow-cyan-400/20",
  },
];

// ── Urgency Levels ─────────────────────────────────────────────────────────────
const URGENCY_LEVELS = [
  { id: "normal", icon: Clock, label: "عادي", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  { id: "urgent", icon: AlertCircle, label: "عاجل", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  { id: "asap", icon: Zap, label: "فوري جداً", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
];

// ── Orders ─────────────────────────────────────────────────────────────────────
type ClientOrder = {
  id: string;
  serviceId: string;
  status: string;
  created_at: string;
  urgency: string;
  title: string | null;
  notes: string | null;
  commune: string | null;
  wilaya: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null;
  attachments: string[];
  offerStatus: string;
  quotedPrice: number | null;
  offerMessage: string | null;
  offerSentAt: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;
  providerResponse: string | null;
  providerResponseDeadline: string | null;
  providerName: string | null;
};

type TimelineEvent = Awaited<ReturnType<typeof getRequestTimeline>>[number];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:     { label: "بانتظار الإرسال", icon: Clock,         color: "text-orange-400", bg: "bg-orange-400/10" },
  DISPATCHED:  { label: "تم الإرسال",      icon: Loader2,       color: "text-blue-400",   bg: "bg-blue-400/10"   },
  IN_PROGRESS: { label: "قيد التنفيذ",     icon: HardHat,       color: "text-yellow-400", bg: "bg-yellow-400/10" },
  COMPLETED:   { label: "مكتمل",           icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-400/10"},
  CANCELLED:   { label: "ملغى",            icon: X,             color: "text-red-400",    bg: "bg-red-400/10"    },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "نقداً",
  card: "بطاقة بنكية",
  transfer: "تحويل بنكي",
  baridi: "بريدي موب",
};

const formatDzd = (value: number | null | undefined) =>
  value === null || value === undefined
    ? null
    : `${new Intl.NumberFormat("ar-DZ").format(value)} دج`;

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("ar-DZ", { day: "numeric", month: "short" }) : null;

const TIMELINE_LABEL: Record<string, string> = {
  created: "تم إنشاء الطلب",
  assigned: "تم تعيين مزوّد",
  offer_sent: "وصل عرض من الإدارة",
  offer_accepted: "قبلت العرض",
  offer_declined: "رفضت العرض",
  declined: "رفضت الإدارة الطلب",
  cancelled: "تم إلغاء الطلب",
  payment_recorded: "تم تسجيل الدفع",
  provider_accepted: "قبل المزوّد المهمة",
  provider_declined: "اعتذر المزوّد",
  provider_timeout: "انتهت مهلة المزوّد",
  status_in_progress: "بدأ العمل",
  status_completed: "اكتمل العمل",
};

export default function ClientCommandPanel() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string>("normal");
  const [wilaya, setWilaya] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, TimelineEvent[]>>({});
  const [timelineLoading, setTimelineLoading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [paymentTarget, setPaymentTarget] = useState<ClientOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClientOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setOrdersLoading(true);
    setOrdersError("");
    try {
      const rows = await getClientBookings();
      setOrders(
        rows.map((b) => ({
          id: b.id,
          serviceId: b.service_type ?? "general",
          status: b.status,
          created_at: b.created_at,
          urgency: b.urgency ?? "normal",
          title: b.listings?.title ?? null,
          notes: b.notes ?? null,
          commune: b.commune ?? null,
          wilaya: b.wilaya ?? null,
          budgetMin: b.budget_min ?? null,
          budgetMax: b.budget_max ?? null,
          preferredDate: b.preferred_date ?? null,
          attachments: b.attachments ?? [],
          offerStatus: b.offer_status ?? "NONE",
          quotedPrice: b.quoted_price ?? null,
          offerMessage: b.offer_message ?? null,
          offerSentAt: b.offer_sent_at ?? null,
          paymentStatus: b.payment_status ?? "UNPAID",
          paymentMethod: b.payment_method ?? null,
          paidAt: b.paid_at ?? null,
          cancellationReason: b.cancellation_reason ?? null,
          cancelledBy: b.cancelled_by ?? null,
          providerResponse: b.provider_response ?? "NONE",
          providerResponseDeadline: b.provider_response_deadline ?? null,
          providerName: b.profiles?.full_name ?? null,
        }))
      );
    } catch (err) {
      // Never fall through to the empty state on failure — an empty list and a
      // failed request look identical to the customer otherwise.
      console.error(err);
      if (!silent) setOrdersError("تعذّر تحميل طلباتك. تحقّق من اتصالك ثم أعد المحاولة.");
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred so the loading flag is set outside the effect body — setting it
    // synchronously here would cascade an extra render on mount.
    const id = requestAnimationFrame(() => {
      void loadOrders();
    });
    // The customer should see provider acceptance / status changes without
    // reloading. Polling is silent so the list never flashes a loading state.
    const interval = setInterval(() => {
      void loadOrders(true);
    }, 30_000);
    return () => {
      cancelAnimationFrame(id);
      clearInterval(interval);
    };
  }, [loadOrders]);

  const loadTimeline = async (id: string) => {
    setTimelineLoading(id);
    try {
      const events = await getRequestTimeline(id);
      setTimelines((prev) => ({ ...prev, [id]: events }));
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(null);
    }
  };

  const toggleExpanded = (order: ClientOrder) => {
    const next = expandedId === order.id ? null : order.id;
    setExpandedId(next);
    setActionError("");
    if (next && !timelines[next]) void loadTimeline(next);
  };

  const handleOfferResponse = async (order: ClientOrder, accept: boolean) => {
    setActionLoading(`${order.id}-offer`);
    setActionError("");
    try {
      await respondToOffer(order.id, accept);
      await loadOrders(true);
      await loadTimeline(order.id);
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "تعذّر تحديث العرض. حاول مجدداً.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(`${cancelTarget.id}-cancel`);
    setActionError("");
    try {
      await cancelClientRequest(cancelTarget.id, cancelReason.trim() || undefined);
      setCancelTarget(null);
      setCancelReason("");
      await loadOrders(true);
      await loadTimeline(cancelTarget.id);
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "تعذّر إلغاء الطلب.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubmit = async (order: ClientOrder) => {
    setActionLoading(`${order.id}-resubmit`);
    setActionError("");
    try {
      await resubmitRequest(order.id);
      await loadOrders(true);
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : "تعذّر إعادة إرسال الطلب.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (method: string) => {
    if (!paymentTarget) throw new Error("لا يوجد طلب محدد");
    await recordPayment(paymentTarget.id, method);
    await loadOrders(true);
    await loadTimeline(paymentTarget.id);
  };

  const selectedService = SERVICES.find((s) => s.id === selected);

  const handleSubmit = async () => {
    if (!selected) return;
    if (!wilaya) {
      setSubmitError("الرجاء اختيار الولاية");
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const result = await createClientRequest({
        service_type: selected,
        urgency,
        wilaya: Number(wilaya),
      });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setSubmitted(true);
      await loadOrders(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelected(null);
        setUrgency("normal");
        setWilaya("");
      }, 2500);
    } catch (err) {
      console.error(err);
      setSubmitError("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceById = (id: string) => SERVICES.find((s) => s.id === id);

  return (
    <div className="min-h-screen space-y-8 text-right" dir="rtl">

      {/* ── Service Icon Grid ───────────────────────────────────── */}
      <div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            const isActive = selected === service.id;
            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelected(isActive ? null : service.id)}
                className={[
                  "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                  isActive
                    ? `bg-gradient-to-br ${service.color} border-transparent shadow-2xl ${service.glow} text-white`
                    : `${service.bg} ${service.border} text-[var(--foreground)] hover:shadow-xl hover:${service.glow}`,
                ].join(" ")}
              >
                {isActive && (
                  <motion.div
                    layoutId="service-glow"
                    className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
                    style={{ background: `linear-gradient(135deg, ${service.color.split(" ")[1]}, ${service.color.split(" ")[3]})` }}
                  />
                )}
                <Icon size={28} className="relative z-10 transition-transform group-hover:scale-110" />
                <div className="relative z-10 text-center">
                  <div className="text-xs font-black leading-tight">{service.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isActive ? "text-white/70" : "text-[var(--muted)]"}`}>{service.subLabel}</div>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-5 h-5 bg-background rounded-full flex items-center justify-center"
                  >
                    <Check size={12} className="text-emerald-600 font-black" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Urgency + Confirm Panel ─────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 space-y-6"
          >
            {/* Urgency */}
            <div>
              <p className="text-sm font-bold text-[var(--muted)] mb-4">مستوى الاستعجال</p>
              <div className="flex gap-3 flex-wrap">
                {URGENCY_LEVELS.map((lvl) => {
                  const Icon = lvl.icon;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setUrgency(lvl.id)}
                      className={[
                        "flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-bold text-sm transition-all",
                        urgency === lvl.id
                          ? `${lvl.bg} ${lvl.border} ${lvl.color} scale-105 shadow-lg`
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/40",
                      ].join(" ")}
                    >
                      <Icon size={16} />
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wilaya */}
            <div>
              <p className="text-sm font-bold text-[var(--muted)] mb-4">الولاية</p>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              >
                <option value="">-- اختر الولاية --</option>
                {WILAYAS.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                <AlertCircle size={16} />
                {submitError}
              </div>
            )}

            {/* Confirm */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-right">
                {selectedService && (
                  <>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedService.color}`}>
                      <selectedService.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="font-black text-[var(--foreground)]">{selectedService.label}</div>
                      <div className="text-xs text-[var(--muted)]">سيتم إرسال طلبك للإدارة</div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="p-3 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitted}
                  className={[
                    "flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm transition-all",
                    submitted
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-lg shadow-[var(--primary)]/20",
                  ].join(" ")}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : submitted ? (
                    <>
                      <CheckCircle2 size={18} />
                      تم الإرسال!
                    </>
                  ) : (
                    <>
                      <ChevronRight size={18} />
                      إرسال الطلب
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Orders ───────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-5">طلباتي الحالية</h2>
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--muted)]">
            <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
            <span className="text-sm">جارٍ تحميل الطلبات...</span>
          </div>
        ) : ordersError ? (
          <div className="rounded-3xl border-2 border-dashed border-red-500/30 bg-red-500/5 p-12 text-center">
            <AlertTriangle size={40} className="mx-auto text-red-400 mb-3" />
            <p className="text-red-400 text-sm font-bold mb-4">{ordersError}</p>
            <button
              onClick={() => { void loadOrders(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm hover:opacity-90"
            >
              <RefreshCw size={14} />
              إعادة المحاولة
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <Package size={40} className="mx-auto text-[var(--muted)] mb-3 opacity-40" />
            <p className="text-[var(--muted)] text-sm">لا يوجد طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-400">
                <AlertCircle size={16} />
                {actionError}
              </div>
            )}

            {orders.map((order) => {
              const svc = getServiceById(order.serviceId);
              const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = st.icon;
              const SvcIcon = svc?.icon ?? Wrench;
              const svcColor = svc?.color ?? "from-slate-500 to-slate-700";
              const isExpanded = expandedId === order.id;
              const hasActiveOffer = order.status === "PENDING" && order.offerStatus === "OFFERED";
              const canCancel = order.status === "PENDING" || order.status === "DISPATCHED";
              const canResubmit = order.status === "CANCELLED";
              const canPay =
                order.offerStatus === "ACCEPTED" &&
                order.paymentStatus !== "PAID" &&
                (order.status === "PENDING" || order.status === "DISPATCHED");
              const budget =
                order.budgetMin !== null && order.budgetMax !== null
                  ? `${formatDzd(order.budgetMin)} — ${formatDzd(order.budgetMax)}`
                  : order.budgetMax !== null
                  ? `حتى ${formatDzd(order.budgetMax)}`
                  : order.budgetMin !== null
                  ? `من ${formatDzd(order.budgetMin)}`
                  : null;
              const events = timelines[order.id];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={[
                    "overflow-hidden rounded-2xl border bg-[var(--card)] transition-all",
                    hasActiveOffer
                      ? "border-amber-500/40"
                      : order.offerStatus === "ACCEPTED" && order.paymentStatus !== "PAID"
                      ? "border-emerald-500/30"
                      : "border-[var(--border)] hover:border-[var(--primary)]/30",
                  ].join(" ")}
                >
                  <button
                    onClick={() => toggleExpanded(order)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-4 p-5 text-right"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${svcColor}`}>
                        <SvcIcon size={20} className="text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[var(--foreground)]">
                            {order.serviceId === "custom"
                              ? "طلب مخصص"
                              : svc?.label ?? order.title ?? "خدمة عامة"}
                          </span>
                          {hasActiveOffer && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                              عرض جديد
                            </span>
                          )}
                          {canPay && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                              بانتظار الدفع
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                          <span>
                            {mounted
                              ? new Date(order.created_at).toLocaleDateString("ar-DZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "..."}
                          </span>
                          {order.wilaya && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {getWilayaName(order.wilaya)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                        <StatusIcon size={14} className={order.status === "DISPATCHED" ? "animate-spin" : ""} />
                        {st.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-[var(--muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[var(--border)]"
                      >
                        <div className="space-y-4 p-5">
                          {/* Details */}
                          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <MapPin size={13} />
                              <span>
                                {order.wilaya ? getWilayaName(order.wilaya) : "ولاية غير محددة"}
                                {order.commune ? ` — ${order.commune}` : ""}
                              </span>
                            </div>
                            {order.preferredDate && (
                              <div className="flex items-center gap-2 text-[var(--muted)]">
                                <CalendarDays size={13} />
                                <span>التاريخ المفضل: {formatDate(order.preferredDate)}</span>
                              </div>
                            )}
                            {budget && (
                              <div className="flex items-center gap-2 text-[var(--muted)]">
                                <Wallet size={13} />
                                <span>الميزانية: {budget}</span>
                              </div>
                            )}
                            {order.providerName && (
                              <div className="flex items-center gap-2 text-[var(--muted)]">
                                <MessageSquare size={13} />
                                <span>المزوّد: {order.providerName}</span>
                              </div>
                            )}
                            {order.status === "DISPATCHED" && order.providerResponse === "PENDING" && (
                              <div className="flex items-center gap-2 text-amber-500">
                                <Clock size={13} />
                                <span>
                                  بانتظار قبول المزوّد
                                  {order.providerResponseDeadline
                                    ? ` (حتى ${new Date(order.providerResponseDeadline).toLocaleTimeString("ar-DZ", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })})`
                                    : ""}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[var(--muted)]">
                              <CreditCard size={13} />
                              <span>
                                {order.paymentStatus === "PAID"
                                  ? `مدفوع${order.paymentMethod ? ` — ${PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}` : ""}`
                                  : "غير مدفوع"}
                              </span>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="rounded-xl bg-[var(--secondary)] p-3">
                              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[var(--muted)]">
                                <FileText size={12} />
                                تفاصيل الطلب
                              </div>
                              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-[var(--foreground)]">
                                {order.notes}
                              </p>
                            </div>
                          )}

                          {order.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {order.attachments.map((url) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="relative block h-20 w-20 overflow-hidden rounded-xl border border-[var(--border)]"
                                >
                                  <Image
                                    src={url}
                                    alt="مرفق الطلب"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Offer */}
                          {order.offerStatus !== "NONE" && order.quotedPrice !== null && (
                            <div
                              className={[
                                "rounded-xl border p-4",
                                order.offerStatus === "OFFERED"
                                  ? "border-amber-500/30 bg-amber-500/5"
                                  : order.offerStatus === "ACCEPTED"
                                  ? "border-emerald-500/30 bg-emerald-500/5"
                                  : "border-red-500/20 bg-red-500/5",
                              ].join(" ")}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                                  <Wallet size={16} className="text-[var(--primary)]" />
                                  عرض الإدارة: {formatDzd(order.quotedPrice)}
                                </div>
                                <span
                                  className={[
                                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                                    order.offerStatus === "OFFERED"
                                      ? "bg-amber-500/15 text-amber-500"
                                      : order.offerStatus === "ACCEPTED"
                                      ? "bg-emerald-500/15 text-emerald-500"
                                      : "bg-red-500/10 text-red-500",
                                  ].join(" ")}
                                >
                                  {order.offerStatus === "OFFERED"
                                    ? "بانتظار ردك"
                                    : order.offerStatus === "ACCEPTED"
                                    ? "قبلت العرض"
                                    : "رفضت العرض"}
                                </span>
                              </div>
                              {order.offerMessage && (
                                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-[var(--muted)]">
                                  {order.offerMessage}
                                </p>
                              )}
                              {order.offerStatus === "OFFERED" && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    disabled={actionLoading === `${order.id}-offer`}
                                    onClick={() => handleOfferResponse(order, true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                                  >
                                    {actionLoading === `${order.id}-offer` ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <CheckCircle2 size={14} />
                                    )}
                                    قبول العرض
                                  </button>
                                  <button
                                    disabled={actionLoading === `${order.id}-offer`}
                                    onClick={() => handleOfferResponse(order, false)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
                                  >
                                    <X size={14} />
                                    رفض العرض
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {order.cancellationReason && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                              <span className="font-bold">سبب الإلغاء: </span>
                              {order.cancellationReason}
                            </div>
                          )}

                          {/* Timeline */}
                          <div>
                            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--muted)]">
                              <History size={12} />
                              سجل الطلب
                            </div>
                            {timelineLoading === order.id && !events ? (
                              <div className="flex items-center gap-2 py-2 text-xs text-[var(--muted)]">
                                <Loader2 size={12} className="animate-spin" />
                                جارٍ التحميل...
                              </div>
                            ) : events && events.length > 0 ? (
                              <ol className="space-y-2 border-r border-[var(--border)] pr-3">
                                {events.map((event) => (
                                  <li key={event.id} className="relative text-xs">
                                    <span className="absolute -right-[17px] top-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
                                    <div className="flex flex-wrap items-baseline gap-2">
                                      <span className="font-bold text-[var(--foreground)]">
                                        {TIMELINE_LABEL[event.action] ?? event.action}
                                      </span>
                                      <span className="text-[10px] text-[var(--muted)]">
                                        {mounted
                                          ? new Date(event.created_at).toLocaleDateString("ar-DZ", {
                                              day: "numeric",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "..."}
                                      </span>
                                    </div>
                                    {event.message && (
                                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">{event.message}</p>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-xs text-[var(--muted)]">لا توجد أحداث بعد.</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                            {canPay && (
                              <button
                                onClick={() => setPaymentTarget(order)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-[var(--primary-foreground)] transition-all hover:opacity-90"
                              >
                                <CreditCard size={14} />
                                الدفع
                              </button>
                            )}
                            {order.status === "COMPLETED" && order.paymentStatus === "PAID" && (
                              <span className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-500">
                                <CheckCircle2 size={14} />
                                تم إكمال الطلب والدفع
                              </span>
                            )}
                            {canResubmit && (
                              <button
                                disabled={actionLoading === `${order.id}-resubmit`}
                                onClick={() => handleResubmit(order)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--primary)]/40 px-4 py-2.5 text-xs font-bold text-[var(--primary)] transition-all hover:bg-[var(--primary)]/10 disabled:opacity-50"
                              >
                                {actionLoading === `${order.id}-resubmit` ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={14} />
                                )}
                                إعادة إرسال الطلب
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => {
                                  setCancelTarget(order);
                                  setCancelReason("");
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10"
                              >
                                <Ban size={14} />
                                إلغاء الطلب
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Payment modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {paymentTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPaymentTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label="الدفع"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
              dir="rtl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-lg font-black text-[var(--foreground)]">الدفع</h3>
                <button
                  onClick={() => setPaymentTarget(null)}
                  className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--secondary)]"
                  aria-label="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>
              <PaymentStep
                amount={paymentTarget.quotedPrice ?? 0}
                label="تم تأكيد الدفع، وسيتم إشعار الإدارة والمزوّد."
                onConfirm={async (method) => {
                  await handlePayment(method);
                }}
                onBack={() => setPaymentTarget(null)}
                onSuccess={() => {
                  setTimeout(() => setPaymentTarget(null), 1800);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cancel confirmation ─────────────────────────────────── */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) setCancelTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label="إلغاء الطلب"
              className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
              dir="rtl"
            >
              <h3 className="text-lg font-black text-[var(--foreground)]">إلغاء الطلب</h3>
              <p className="text-xs text-[var(--muted)]">
                هل أنت متأكد؟ بعد الإلغاء يمكنك إعادة إرسال الطلب لاحقاً.
              </p>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-[var(--foreground)]">سبب الإلغاء (اختياري)</span>
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="لماذا تريد إلغاء الطلب؟"
                />
              </label>
              <div className="flex gap-3">
                <button
                  disabled={actionLoading === `${cancelTarget.id}-cancel`}
                  onClick={handleCancel}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {actionLoading === `${cancelTarget.id}-cancel` ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Ban size={16} />
                  )}
                  تأكيد الإلغاء
                </button>
                <button
                  onClick={() => setCancelTarget(null)}
                  disabled={actionLoading === `${cancelTarget.id}-cancel`}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--muted)] transition-all hover:bg-[var(--secondary)] disabled:opacity-50"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
