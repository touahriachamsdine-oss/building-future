import { getSiteConfig } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن | بناء المستقبل",
  description: "تعرف على منصة بناء المستقبل - كل ما تحتاجه للبناء في مكان واحد",
};

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-black text-foreground mb-6">من نحن</h1>
          <div className="w-24 h-1.5 bg-primary rounded-full mb-8" />
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {config.about_ar}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-black text-foreground mb-8">رؤيتنا</h2>
          <p className="text-muted-foreground leading-relaxed">
            نسعى لأن نكون المنصة الرقمية الأولى في الجزائر لقطاع البناء والتشييد، من خلال توفير حلول مبتكرة تربط بين جميع الفاعلين في القطاع.
          </p>
        </div>
      </section>
    </div>
  );
}
