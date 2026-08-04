"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

type PaymentMethod = "cash" | "card" | "transfer" | "baridi";

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: typeof Banknote;
  desc: string;
}

const METHODS: PaymentMethodOption[] = [
  { id: "cash", label: "نقداً عند الاستلام", icon: Banknote, desc: "الدفع نقداً عند تسلم الخدمة أو المنتج" },
  { id: "card", label: "بطاقة بنكية", icon: CreditCard, desc: "الدفع عبر بطاقة CIB/Dahab الذهبية" },
  { id: "transfer", label: "تحويل بنكي", icon: Landmark, desc: "تحويل إلى الحساب البنكي للمنصة" },
  { id: "baridi", label: "بريدي موب", icon: Smartphone, desc: "الدفع عبر تطبيق بريدي موب" },
];

interface PaymentStepProps {
  amount: number;
  label?: string;
  onConfirm: (method: PaymentMethod) => Promise<void>;
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function PaymentStep({ amount, label, onConfirm, onBack, onSuccess }: PaymentStepProps) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"select" | "processing" | "success" | "failed">("select");

  const handlePay = async () => {
    if (!method) return;
    setStep("processing");
    try {
      await onConfirm(method);
      setStep("success");
      onSuccess?.();
    } catch {
      setStep("failed");
    }
  };

  const formattedPrice = amount.toLocaleString();

  if (step === "processing") {
    return (
      <div className="py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <Loader2 size={32} className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">جاري معالجة الدفع...</p>
          <p className="text-sm text-muted-foreground mt-2">يرجى الانتظار، لا تغلق النافذة</p>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-2 bg-muted rounded-full w-3/4 mx-auto" />
          <div className="h-2 bg-muted rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="py-12 text-center space-y-5"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={44} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-foreground">تم الدفع بنجاح!</h3>
          <p className="text-muted-foreground mt-2">{label || "تم تأكيد طلبك وستصلك الإشعارات عبر البريد والموقع"}</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-primary/5 rounded-xl px-6 py-3 border border-primary/10">
          <span className="text-sm text-muted-foreground">المبلغ:</span>
          <span className="text-xl font-black text-primary">{formattedPrice} دج</span>
        </div>
      </motion.div>
    );
  }

  if (step === "failed") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="py-12 text-center space-y-5"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle size={44} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-foreground">فشلت عملية الدفع</h3>
          <p className="text-muted-foreground mt-2">حدث خطأ أثناء معالجة الدفع. حاول مرة أخرى.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="brutal" onClick={() => setStep("select")}>حاول مرة أخرى</Button>
          {onBack && <Button variant="outline" onClick={onBack}>رجوع</Button>}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-foreground">اختر طريقة الدفع</h4>
        <div className="flex items-center gap-1.5 text-primary font-black">
          <span className="text-sm font-medium text-muted-foreground">المبلغ:</span>
          <span>{formattedPrice} دج</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const selected = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-right transition-all ${
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground truncate">{m.desc}</p>
              </div>
              {selected && <ChevronRight size={18} className="text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1 border-border">
            رجوع
          </Button>
        )}
        <Button
          variant="brutal"
          className="flex-1 h-12"
          disabled={!method}
          onClick={handlePay}
        >
          {!method ? "اختر طريقة دفع" : "تأكيد الدفع"}
        </Button>
      </div>
    </div>
  );
}
