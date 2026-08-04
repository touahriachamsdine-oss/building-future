"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { FileText, Download, Calendar } from "lucide-react";

const REPORTS = [
  { title: "تقرير المستخدمين الشهري", desc: "إحصائيات المستخدمين الجدد والنشطين", date: "2026-06-01" },
  { title: "تقرير المبيعات ربع السنوي", desc: "المعاملات المالية والمبيعات", date: "2026-04-01" },
  { title: "تقرير الإعلانات", desc: "الإعلانات المنشورة حسب التصنيف", date: "2026-06-15" },
  { title: "تقرير أداء المنصة", desc: "مؤشرات الأداء الرئيسية للمنصة", date: "2026-07-01" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">التقارير</h1>
        <p className="text-muted-foreground">التقارير الدورية والإحصائيات المفصلة</p>
      </div>

      <div className="grid gap-4">
        {REPORTS.map((r, i) => (
          <Card key={i} className="border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar size={12} />
                    {r.date}
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                <Download size={16} />
                تحميل
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            قريباً: تقارير مخصصة مع إمكانية تحديد النطاق الزمني وتصدير PDF و Excel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
