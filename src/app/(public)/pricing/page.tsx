import { Metadata } from "next";
import { CheckCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الأسعار | بناء المستقبل",
  description: "خطط الأسعار لمستخدمي منصة بناء المستقبل",
};

const PLANS = [
  {
    name: "مجاني",
    price: "0",
    description: "للمستخدمين العاديين وأصحاب المشاريع",
    features: [
      "تصفح الإعلانات والخدمات",
      "إرسال طلبات شراء",
      "التواصل مع المزودين",
      "متابعة الطلبات",
    ],
    popular: false,
  },
  {
    name: "مزود",
    price: "مجاناً",
    description: "للحرفيين والموردين وأصحاب العتاد",
    features: [
      "نشر إعلانات غير محدودة",
      "استقبال طلبات العملاء",
      "لوحة تحكم متقدمة",
      "إحصائيات الأداء",
      "دعم فني priority",
    ],
    popular: true,
  },
  {
    name: "مؤسسة",
    price: "قريباً",
    description: "للشركات والمؤسسات الكبرى",
    features: [
      "حسابات متعددة",
      "API للتكامل",
      "تقارير متقدمة",
      "مدير حساب مخصص",
      "عقود سنوية",
    ],
    popular: false,
    disabled: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-black text-foreground">الأسعار</h1>
            <div className="w-24 h-1.5 bg-primary rounded-full mx-auto" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              منصة بناء المستقبل مجانية لجميع المستخدمين. اختر الخطة التي تناسبك.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card border-2 rounded-3xl p-8 space-y-6 relative ${
                  plan.popular ? "border-primary shadow-xl scale-105" : "border-border"
                } ${plan.disabled ? "opacity-60" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-sm font-bold">
                    الأكثر طلباً
                  </div>
                )}

                <div className="text-center space-y-2 pt-2">
                  <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                  <div className="text-4xl font-black text-primary">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full py-3 rounded-xl text-center font-bold text-sm transition-all ${
                    plan.disabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground border border-border hover:bg-primary/10"
                  }`}
                >
                  {plan.disabled ? "قريباً" : "ابدأ الآن"}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-card border border-border rounded-3xl p-8 flex items-start gap-4">
            <HelpCircle size={24} className="text-primary shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-lg">هل لديك أسئلة حول الأسعار؟</h3>
              <p className="text-muted-foreground">
                جميع الخدمات الأساسية مجانية حالياً. نحن نعمل على إضافة خطط مدفوعة بميزات إضافية قريباً.
                للاستفسارات، يرجى التواصل مع فريق الدعم.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
