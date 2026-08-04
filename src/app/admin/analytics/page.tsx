"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { BarChart, Users, ShoppingBag, TrendingUp, Eye } from "lucide-react";

const STATS = [
  { label: "إجمالي المستخدمين", value: "24,562", icon: Users, change: "+12%", up: true },
  { label: "الإعلانات المنشورة", value: "8,245", icon: ShoppingBag, change: "+8%", up: true },
  { label: "المعاملات المنجزة", value: "3,891", icon: TrendingUp, change: "+23%", up: true },
  { label: "مشاهدات الصفحات", value: "142K", icon: Eye, change: "+5%", up: true },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">الإحصائيات</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{s.value}</div>
                <div className={`text-xs font-bold flex items-center gap-1 ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  <TrendingUp size={14} />
                  {s.change} عن الشهر الماضي
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <BarChart size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">الرسوم البيانية قيد التطوير</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            سيتم إضافة رسوم بيانية تفاعلية للمبيعات، المستخدمين الجدد، والإعلانات قريباً.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
