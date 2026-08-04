"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import PaymentStep from "@/components/ui/PaymentStep";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import Link from "next/link";

const MOCK_INVOICE = {
  id: "INV-2024-001",
  items: [
    { name: "أسمنت بورتلاندي CPJ-42.5", qty: 50, unit: "كيس", price: 890 },
  ],
  subtotal: 44500,
  tax: 2225,
  total: 46725,
  provider: "مؤسسة بن عمر لمواد البناء",
  date: new Date().toLocaleDateString("ar-DZ"),
};

export default function PaymentPage() {
  const [step, setStep] = useState<"details" | "payment" | "success" | "failed">("details");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-primary transition-colors">الإعلانات</Link>
          <span>/</span>
          <span className="text-foreground font-medium">الدفع</span>
        </nav>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">إتمام الدفع</h1>
            <p className="text-muted-foreground text-sm">فاتورة #{MOCK_INVOICE.id}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {["details", "payment", "success"].map((s) => (
            <div key={s} className={cn(
              "flex-1 h-2 rounded-full transition-all",
              (step === s || (step === "failed" && s === "payment"))
                ? "bg-primary"
                : ["payment", "success"].includes(step) && ["payment", "success"].includes(s)
                ? "bg-primary"
                : "bg-muted"
            )} />
          ))}
        </div>

        <Card className="border-2 border-border rounded-3xl">
          <CardContent className="p-8 space-y-6">
            {step === "details" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">تفاصيل الفاتورة</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">المزود</span>
                    <span className="font-bold text-foreground">{MOCK_INVOICE.provider}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">التاريخ</span>
                    <span className="font-bold text-foreground">{MOCK_INVOICE.date}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">رقم الفاتورة</span>
                    <span className="font-bold text-foreground font-mono" dir="ltr">{MOCK_INVOICE.id}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-3 font-bold text-foreground">المنتج</th>
                        <th className="text-center p-3 font-bold text-foreground">الكمية</th>
                        <th className="text-center p-3 font-bold text-foreground">السعر</th>
                        <th className="text-left p-3 font-bold text-foreground">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_INVOICE.items.map((item, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="p-3 text-foreground">{item.name}</td>
                          <td className="p-3 text-center text-muted-foreground">{item.qty} {item.unit}</td>
                          <td className="p-3 text-center text-muted-foreground">{item.price.toLocaleString()} دج</td>
                          <td className="p-3 text-left font-bold text-foreground">{(item.qty * item.price).toLocaleString()} دج</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pr-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="text-foreground">{MOCK_INVOICE.subtotal.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الضريبة (5%)</span>
                    <span className="text-foreground">{MOCK_INVOICE.tax.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-primary border-t border-border pt-2 mt-2">
                    <span>المجموع</span>
                    <span>{MOCK_INVOICE.total.toLocaleString()} دج</span>
                  </div>
                </div>

                <Button variant="brutal" className="w-full h-14 text-lg" onClick={() => setStep("payment")}>
                  متابعة الدفع
                </Button>
              </div>
            )}

            {step === "payment" && (
              <PaymentStep
                amount={MOCK_INVOICE.total}
                onBack={() => setStep("details")}
                onSuccess={() => setStep("success")}
                onConfirm={async (method) => {
                  await new Promise(r => setTimeout(r, 2500));
                  if (method === "card") {
                    // simulate occasional card failure
                    // throw new Error("فشلت المعاملة");
                  }
                }}
              />
            )}

            {step === "success" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 text-center space-y-5"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={44} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-foreground">تم الدفع بنجاح!</h2>
                <p className="text-muted-foreground">رقم الفاتورة: <span className="font-bold font-mono" dir="ltr">{MOCK_INVOICE.id}</span></p>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 inline-flex items-center gap-2 mx-auto">
                  <span className="text-2xl font-black text-primary">{MOCK_INVOICE.total.toLocaleString()} دج</span>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Link href="/dashboard/client">
                    <Button variant="brutal">الذهاب إلى الطلبات</Button>
                  </Link>
                  <Link href="/listings">
                    <Button variant="outline">متابعة التسوق</Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {step === "failed" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 text-center space-y-5"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <XCircle size={44} className="text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-foreground">فشلت عملية الدفع</h2>
                <p className="text-muted-foreground">يرجى المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة</p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="brutal" onClick={() => setStep("payment")}>حاول مرة أخرى</Button>
                  <Button variant="outline" onClick={() => setStep("details")}>رجوع</Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
