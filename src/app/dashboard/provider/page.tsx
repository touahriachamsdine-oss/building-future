"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
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
  CheckCircle2,
  Play,
  X,
  Bell,
  MapPin,
  ChevronDown,
  Loader2,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { getProviderBookings, updateBookingStatus } from "@/lib/db";
import { getWilayaName } from "@/lib/wilayas";

// ── Service icons map ──────────────────────────────────────────────────────────
const SERVICE_MAP: Record<string, { icon: React.ElementType; label: string; color: string; grad: string }> = {
  masonry:     { icon: Building2,    label: "بناء وتشييد",    color: "text-amber-400",   grad: "from-amber-500 to-orange-600" },
  plumbing:    { icon: Droplets,     label: "سباكة",           color: "text-blue-400",    grad: "from-blue-500 to-cyan-600" },
  electricity: { icon: Zap,          label: "كهرباء",          color: "text-yellow-400",  grad: "from-yellow-400 to-amber-500" },
  painting:    { icon: PaintBucket,  label: "دهان وطلاء",    color: "text-pink-400",    grad: "from-pink-500 to-rose-600" },
  carpentry:   { icon: Hammer,       label: "نجارة",           color: "text-green-400",   grad: "from-green-500 to-emerald-600" },
  tiling:      { icon: Layers,       label: "تبليط وسيراميك", color: "text-violet-400",  grad: "from-violet-500 to-purple-600" },
  ironwork:    { icon: Wrench,       label: "حدادة",           color: "text-slate-400",   grad: "from-slate-400 to-slate-600" },
  excavation:  { icon: Shovel,       label: "حفر وترابية",   color: "text-amber-600",   grad: "from-amber-700 to-amber-900" },
  transport:   { icon: Truck,        label: "نقل ومواد",      color: "text-sky-400",     grad: "from-sky-500 to-blue-600" },
  materials:   { icon: Package,      label: "توريد مواد",     color: "text-teal-400",    grad: "from-teal-500 to-green-600" },
  safety:      { icon: HardHat,      label: "إشراف وسلامة",  color: "text-orange-400",  grad: "from-orange-400 to-red-500" },
  hvac:        { icon: Thermometer,  label: "تكييف وتدفئة", color: "text-cyan-400",    grad: "from-cyan-400 to-teal-500" },
  general:     { icon: Wrench,       label: "خدمة عامة",      color: "text-slate-400",   grad: "from-slate-500 to-slate-700" },
};

// ── Urgency config ─────────────────────────────────────────────────────────────
const URGENCY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  normal: { label: "عادي",        icon: Clock,         color: "text-blue-400",   bg: "bg-blue-400/10" },
  urgent: { label: "عاجل",        icon: AlertCircle,   color: "text-orange-400", bg: "bg-orange-400/10" },
  asap:   { label: "فوري جداً",  icon: Zap,           color: "text-red-400",    bg: "bg-red-400/10" },
};

type Order = {
  id: string;
  serviceId: string;
  urgency: string;
  status: string;
  address: string;
  wilaya: string;
  dispatchedAt: string;
  notes: string | null;
  adminNote: string | null;
};

const mapOrders = (rows: Awaited<ReturnType<typeof getProviderBookings>>) =>
  rows
    .filter((b) => b.status !== "CANCELLED")
    .map((b): Order => ({
      id: b.id,
      serviceId: b.service_type ?? "general",
      urgency: b.urgency ?? "normal",
      status: b.status,
      address: b.wilaya ? getWilayaName(b.wilaya) : "عنوان غير محدد",
      wilaya: b.wilaya ? getWilayaName(b.wilaya) : "غير محدد",
      dispatchedAt: b.created_at,
      notes: b.notes ?? null,
      adminNote: b.notes ?? b.listings?.title ?? "مهمة جديدة",
    }));

// ── Status timeline config ─────────────────────────────────────────────────────
const STATUS_STEPS = ["DISPATCHED", "IN_PROGRESS", "COMPLETED"] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING:     "طلب جديد",
  DISPATCHED:  "طلب وارد",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED:   "مكتمل",
  CANCELLED:   "ملغى",
};

export default function WorkerDispatchInbox() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "DISPATCHED" | "IN_PROGRESS" | "COMPLETED">("ALL");

  const loadOrders = async () => {
    try {
      const rows = await getProviderBookings();
      setOrders(mapOrders(rows));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let active = true;
    getProviderBookings()
      .then((rows) => {
        if (active) setOrders(mapOrders(rows));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    const interval = setInterval(() => {
      getProviderBookings().then((rows) => setOrders(mapOrders(rows))).catch((err) => console.error(err));
    }, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const pending = orders.filter((o) => o.status === "DISPATCHED" || o.status === "PENDING").length;

  const handleAction = async (id: string, action: "start" | "complete" | "decline") => {
    setActionLoading(id + action);
    try {
      const status =
        action === "start" ? "IN_PROGRESS" :
        action === "complete" ? "COMPLETED" :
        "CANCELLED";
      await updateBookingStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (action !== "decline") setExpanded(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const activeFilters = [
    { id: "ALL",         label: "الكل" },
    { id: "DISPATCHED",  label: "طلبات واردة" },
    { id: "IN_PROGRESS", label: "قيد التنفيذ" },
    { id: "COMPLETED",   label: "مكتملة" },
  ];

  return (
    <div className="min-h-screen space-y-8 text-right" dir="rtl">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--secondary)] border border-[var(--border)] p-8">
        <div className="absolute inset-0 diagonal-bg opacity-5" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">صندوق المهام</p>
            <h1 className="text-3xl font-black text-[var(--foreground)]">أوامر العمل الواردة</h1>
            <p className="text-[var(--muted)] mt-2 text-sm">تأتيك المهام من الإدارة — لا تتصل بالعملاء مباشرة</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              تحديث
            </button>
            {pending > 0 && (
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                  <Bell size={28} className="text-[var(--primary-foreground)]" />
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-[var(--card)]">
                  {pending}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {activeFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={[
              "px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all",
              filter === f.id
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent shadow-lg"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {f.label}
            {f.id === "DISPATCHED" && pending > 0 && (
              <span className="mr-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--muted)]">
            <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
            <span className="text-sm">جارٍ تحميل المهام...</span>
          </div>
        ) : filtered.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-[var(--border)] p-12 text-center">
            <CheckCheck size={40} className="mx-auto text-[var(--muted)] mb-3 opacity-30" />
            <p className="text-[var(--muted)] text-sm">لا توجد مهام في هذه الفئة</p>
          </div>
        )}

        {filtered.map((order) => {
          const svc = SERVICE_MAP[order.serviceId] ?? SERVICE_MAP.general;
          const urg = URGENCY_CONFIG[order.urgency] ?? URGENCY_CONFIG.normal;
          const isExpanded = expanded === order.id;
          const SvcIcon = svc.icon;
          const UrgIcon = urg.icon;
          const stepIdx = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={[
                "bg-[var(--card)] border rounded-2xl overflow-hidden transition-all",
                order.status === "DISPATCHED" || order.status === "PENDING" ? "border-[var(--primary)]/50 shadow-lg shadow-[var(--primary)]/5" : "border-[var(--border)]",
                order.status === "COMPLETED" ? "opacity-60" : "",
              ].join(" ")}
            >
              {/* Row */}
              <button
                className="w-full flex items-center justify-between p-5 text-right"
                onClick={() => setExpanded(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Service icon pill */}
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${svc.grad} shadow-md`}>
                    <SvcIcon size={22} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[var(--foreground)]">{svc.label}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${urg.bg} ${urg.color}`}>
                        <UrgIcon size={10} />
                        {urg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                      <MapPin size={11} />
                      {order.wilaya}
                      <span className="mx-1">·</span>
                      {mounted ? new Date(order.dispatchedAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }) : "..."}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === "PENDING"     ? "bg-orange-400/15 text-orange-400" :
                    order.status === "DISPATCHED"  ? "bg-[var(--primary)]/15 text-[var(--primary)]" :
                    order.status === "IN_PROGRESS" ? "bg-yellow-400/15 text-yellow-400" :
                    order.status === "COMPLETED"   ? "bg-emerald-400/15 text-emerald-400" :
                    "bg-red-400/15 text-red-400"
                  }`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[var(--muted)] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-5 border-t border-[var(--border)] pt-5">

                      {/* Admin message (icon-based label only, no freetext from client) */}
                      <div className="flex items-center gap-3 bg-[var(--secondary)]/50 rounded-xl p-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${svc.grad}`}>
                          <SvcIcon size={18} className="text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--muted)] mb-0.5">ملاحظة الإدارة</p>
                          <p className="text-sm font-bold text-[var(--foreground)]">{order.adminNote || "مهمة موحدة"}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
                        <MapPin size={16} className="text-[var(--primary)] shrink-0" />
                        <span>{order.address}</span>
                      </div>

                      {/* Progress stepper */}
                      {stepIdx >= 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {STATUS_STEPS.map((step, si) => (
                            <div key={step} className="flex items-center gap-2 flex-1">
                              <div className={[
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 transition-all",
                                si <= stepIdx
                                  ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                                  : "border-[var(--border)] text-[var(--muted)]",
                              ].join(" ")}>
                                {si < stepIdx ? <CheckCircle2 size={16} /> : si + 1}
                              </div>
                              <span className={`text-[10px] font-bold hidden sm:block ${si <= stepIdx ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                                {STATUS_LABEL[step]}
                              </span>
                              {si < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 ${si < stepIdx ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {(order.status === "DISPATCHED" || order.status === "PENDING") && (
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={() => handleAction(order.id, "start")}
                            disabled={!!actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20"
                          >
                            {actionLoading === order.id + "start"
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Play size={16} />}
                            ابدأ العمل
                          </button>
                          <button
                            onClick={() => handleAction(order.id, "decline")}
                            disabled={!!actionLoading}
                            className="px-5 py-3 rounded-xl border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                          >
                            {actionLoading === order.id + "decline" ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                          </button>
                        </div>
                      )}

                      {order.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => handleAction(order.id, "complete")}
                          disabled={!!actionLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          {actionLoading === order.id + "complete" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          إنهاء المهمة
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
