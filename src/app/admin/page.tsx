"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { AdminDispatchClient } from "./AdminDispatchClient";
import { getAdminStats, getDispatchHistory } from "@/lib/db";
import { WILAYAS } from "@/lib/wilayas";

const nf = new Intl.NumberFormat("ar-DZ");

const formatDzd = (n: number) => `${nf.format(n)} دج`;

export default function AdminOverview() {
  const [data, setData] = useState<{
    stats: Awaited<ReturnType<typeof getAdminStats>>;
    recent: Awaited<ReturnType<typeof getDispatchHistory>>;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminStats(), getDispatchHistory(5)])
      .then(([stats, recent]) => { if (!cancelled) setData({ stats, recent }); })
      .catch((err) => {
        console.error("[admin] failed to load stats", err);
        if (!cancelled) setLoadError("تعذّر تحميل الإحصائيات. لا يتم عرض أرقام تقديرية.");
      });
    return () => { cancelled = true; };
  }, []);
  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
        <p className="font-black text-foreground">{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const { stats, recent } = data;

  const cards = [
    {
      title: "إجمالي المستخدمين",
      value: nf.format(stats.totalUsers),
      detail: `+${stats.newUsers7d} هذا الأسبوع`,
      icon: Users,
      positive: true,
    },
    {
      title: "إجمالي الإعلانات",
      value: nf.format(stats.totalListings),
      detail: `+${stats.newListings7d} هذا الأسبوع`,
      icon: Package,
      positive: true,
    },
    {
      title: "الطلبات المكتملة",
      value: nf.format(stats.completedOrders),
      detail: "إجمالي الطلبات المنجزة",
      icon: TrendingUp,
      positive: true,
    },
    {
      title: "الإيرادات المحققة",
      value: formatDzd(stats.totalRevenue),
      detail: `${formatDzd(stats.revenue30d)} خلال 30 يوماً`,
      icon: DollarSign,
      positive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all group shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <stat.icon className="text-primary" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="text-emerald-500" size={16} />
                <span className="text-emerald-500">{stat.detail}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">تحليلات النمو</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a6741" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4a6741" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} 
                  itemStyle={{ color: "#0f172a" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#4a6741" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">آخر النشاطات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                لا توجد مهام مُسندة بعد.
              </p>
            ) : (
              recent.map((h) => (
                <div key={h.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border shrink-0">
                    <Users size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-right" dir="rtl">
                    <p className="text-sm font-bold text-foreground">
                      {h.task?.trim() || "مهمة خدمة"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {h.wilaya != null && `${WILAYAS.find((w) => w.id === h.wilaya)?.name ?? ""} • `}
                      {new Date(h.created_at).toLocaleDateString("ar-DZ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Request Dispatch — embedded from /admin/dispatch */}
      <AdminDispatchClient />
    </div>
  );
}
