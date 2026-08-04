"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, Phone, MapPin } from "lucide-react";
import { getSiteConfig } from "@/lib/db";
import { useState, useEffect } from "react";
import type { SiteConfig } from "@/lib/db";

const FALLBACK: SiteConfig = {
  company_name: "بناء المستقبل",
  company_name_en: "Binaa Mostaqbal",
  company_name_fr: "Bâtiment Avenir",
  tagline: "كل ما تحتاجه للبناء في مكان واحد",
  about_ar: "منصة بَنّاي الرقمية - كل ما تحتاجه للبناء في مكان واحد. تجمع بين موردي المواد، أصحاب العتاد، وأفضل الحرفيين في جميع الولايات الـ 58.",
  about_en: "",
  about_fr: "",
  contact_phone: "+213 (0) 555 55 55 55",
  contact_email: "contact@binamostaqbal.dz",
  contact_address: "حي الأعمال، وسط المدينة",
  contact_address_en: "",
  contact_address_fr: "",
  privacy_ar: "",
  privacy_en: "",
  privacy_fr: "",
  terms_ar: "",
  terms_en: "",
  terms_fr: "",
  maintenance_mode: false,
  auto_approve_providers: true,
  manual_listing_review: false,
};

const Footer = () => {
  const [config, setConfig] = useState<SiteConfig>(FALLBACK);

  useEffect(() => {
    getSiteConfig().then(setConfig).catch(() => {});
  }, []);

  return (
    <footer className="bg-card mt-auto border-t border-border/40">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/logo.png" 
                alt="بَنّاي - كل ما تحتاجه للبناء في مكان واحد" 
                width={80}
                height={80}
                className="h-20 w-auto object-contain rounded-xl border border-primary/30 p-2 bg-card shadow-md"
              />
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              {config.about_ar}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2.5 bg-secondary rounded-full hover:bg-primary/20 text-foreground transition-colors">
                <Globe size={20} />
              </Link>
              <Link href="#" className="p-2.5 bg-secondary rounded-full hover:bg-primary/20 text-foreground transition-colors">
                <Globe size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">المنصة</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/listings" className="hover:text-primary transition-colors">تصفح الإعلانات</Link></li>
              <li><Link href="/listings?cat=craftsman" className="hover:text-primary transition-colors">ابحث عن حرفي</Link></li>
              <li><Link href="/waste" className="hover:text-primary transition-colors">سوق النفايات</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">الأسعار</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">الشركة</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">اتصل بنا</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-foreground">اتصل بنا</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                <span>{config.contact_phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                <span>{config.contact_email}</span>
              </li>
              <li className="flex items-center gap-3 text-right">
                <MapPin size={18} className="text-primary flex-shrink-0" />
                <span>{config.contact_address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {config.company_name}. جميع الحقوق محفوظة.</p>
          <p>صنع بكل حب 🛠️</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
