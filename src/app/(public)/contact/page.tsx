import { getSiteConfig } from "@/lib/db";
import { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "اتصل بنا | بناء المستقبل",
  description: "تواصل مع فريق بناء المستقبل",
};

export default async function ContactPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-black text-foreground mb-6">اتصل بنا</h1>
          <div className="w-24 h-1.5 bg-primary rounded-full mb-8" />
          <p className="text-lg text-muted-foreground mb-12">
            تواصل مع فريق بناء المستقبل لأي استفسار أو اقتراح.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Phone size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground">الهاتف</h3>
              <p className="text-muted-foreground" dir="ltr">{config.contact_phone}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Mail size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground">البريد الإلكتروني</h3>
              <p className="text-muted-foreground" dir="ltr">{config.contact_email}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground">العنوان</h3>
              <p className="text-muted-foreground">{config.contact_address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
