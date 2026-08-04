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
  Loader2,
} from "lucide-react";
import { createClientRequest, getClientBookings } from "@/lib/db";
import { WILAYAS } from "@/lib/wilayas";

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

// ── Mock Active Orders ─────────────────────────────────────────────────────────
type ClientOrder = {
  id: string;
  serviceId: string;
  status: string;
  created_at: string;
  urgency: string;
  title: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:     { label: "بانتظار الإرسال", icon: Clock,         color: "text-orange-400", bg: "bg-orange-400/10" },
  DISPATCHED:  { label: "تم الإرسال",      icon: Loader2,       color: "text-blue-400",   bg: "bg-blue-400/10"   },
  IN_PROGRESS: { label: "قيد التنفيذ",     icon: HardHat,       color: "text-yellow-400", bg: "bg-yellow-400/10" },
  COMPLETED:   { label: "مكتمل",           icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-400/10"},
  CANCELLED:   { label: "ملغى",            icon: X,             color: "text-red-400",    bg: "bg-red-400/10"    },
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

  useEffect(() => {
    getClientBookings()
      .then((rows) => {
        const mapped: ClientOrder[] = rows.map((b) => ({
          id: b.id,
          serviceId: b.service_type ?? "general",
          status: b.status,
          created_at: b.created_at,
          urgency: b.urgency ?? "normal",
          title: b.listings?.title ?? null,
        }));
        setOrders(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  }, []);

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
      await createClientRequest({
        service_type: selected,
        urgency,
        wilaya: Number(wilaya),
      });
      setSubmitted(true);
      setOrders((prev) => [
        {
          id: `tmp-${Date.now()}`,
          serviceId: selected,
          status: "PENDING",
          created_at: new Date().toISOString(),
          urgency,
          title: null,
        },
        ...prev,
      ]);
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

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-8">
        <div className="absolute inset-0 diagonal-bg opacity-5" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">لوحة الطلبات</p>
          <h1 className="text-3xl font-black text-[var(--foreground)]">اختر الخدمة التي تحتاجها</h1>
          <p className="text-[var(--muted)] mt-2 text-sm leading-relaxed">
            انقر على الأيقونة المناسبة لطلب الخدمة — لا حاجة للكتابة
          </p>
        </div>
      </div>

      {/* ── Service Icon Grid ───────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-5">الخدمات المتاحة</h2>
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
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <Package size={40} className="mx-auto text-[var(--muted)] mb-3 opacity-40" />
            <p className="text-[var(--muted)] text-sm">لا يوجد طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const svc = getServiceById(order.serviceId);
              const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = st.icon;
              const SvcIcon = svc?.icon ?? Wrench;
              const svcColor = svc?.color ?? "from-slate-500 to-slate-700";
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--primary)]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${svcColor}`}>
                      <SvcIcon size={20} className="text-white" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--foreground)]">{svc?.label ?? order.title ?? "خدمة عامة"}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {mounted ? new Date(order.created_at).toLocaleDateString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) : "..."}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                    <StatusIcon size={14} className={order.status === "DISPATCHED" ? "animate-spin" : ""} />
                    {st.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
