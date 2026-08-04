import { getSiteConfig } from "@/lib/db";
import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | بناء المستقبل",
  description: "سياسة الخصوصية لمنصة بناء المستقبل",
};

export default async function PrivacyPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={40} className="text-primary" />
            <h1 className="text-5xl font-black text-foreground">سياسة الخصوصية</h1>
          </div>
          <div className="w-24 h-1.5 bg-primary rounded-full mb-8" />
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {config.privacy_ar}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
