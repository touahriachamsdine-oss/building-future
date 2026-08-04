"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { InnerAdBanner } from "@/components/ui/InnerAdBanner";
import { motion } from "framer-motion";
import { Hammer, Truck, Package, Search, ChevronRight, Star, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] py-16 flex items-center overflow-hidden diagonal-bg wall-texture">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="z-10 space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border-2 border-primary/50 text-primary text-sm font-black shadow-md gritty-wall">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              أكبر سوق رقمي للبناء
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight text-foreground">
              نحن نبني <span className="text-primary underline decoration-primary decoration-wavy">مستقبل</span> البناء
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              المنصة الشاملة التي تجمع بين موردي مواد البناء، أصحاب العتاد، وأفضل الحرفيين في مكان واحد. وفر وقتك وجهدك وابدأ مشروعك الآن.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/categories/building-materials">
                <Button variant="brutal" size="lg" className="gap-2 px-8 py-6 text-lg">
                  تصفح الإعلانات <ChevronRight size={22} />
                </Button>
              </Link>
              <Link href="/signup?role=PROVIDER">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-8 py-6 text-lg">
                  كن مزوداً للخدمة
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="relative border-4 border-primary bg-card p-5 rounded-2xl shadow-brutal rotate-2 hover:rotate-0 transition-transform duration-500 overflow-hidden">
               {/* High-Quality Thematic Listings Preview */}
               <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-3" dir="rtl">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary" />
                   <span className="text-sm font-black text-primary">أحدث العروض الحية</span>
                 </div>
                 <span className="text-xs text-muted-foreground font-bold bg-secondary px-2.5 py-1 rounded-full border border-primary/30">محدث الآن</span>
               </div>
               <div className="grid grid-cols-2 gap-3" dir="rtl">
                  {[
                    { title: "أسمنت بورتلاند 42.5", category: "مواد البناء", price: "850 دج / كيس", img: "/images/materials.png" },
                    { title: "رافعة كوماتسو 50 طن", category: "العتاد والأدوات", price: "25,000 دج / يوم", img: "/images/equipment.png" },
                    { title: "معلم بناء وتلبيس خبير", category: "الحرفيون", price: "تقييم 4.9 ★", img: "/images/craftsman.png" },
                    { title: "شاحنة رفع وتدوير الردم", category: "تدوير النفايات", price: "12,000 دج / حمولة", img: "/images/recycling.png" },
                  ].map((item, i) => (
                    <div key={i} className="group relative rounded-xl bg-secondary border-2 border-primary/30 hover:border-primary overflow-hidden transition-all shadow-md">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-md text-primary text-[10px] font-black px-2 py-0.5 rounded border border-primary/40">
                          {item.category}
                        </div>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="font-bold text-xs text-foreground truncate">{item.title}</div>
                        <div className="text-[11px] font-black text-primary">{item.price}</div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -top-6 -left-6 bg-primary text-primary-foreground p-4 rounded-xl border-3 border-foreground shadow-brutal -rotate-6 animate-bounce">
              <Star className="text-primary-foreground fill-primary-foreground mb-1" size={24} />
              <div className="font-black text-lg">+5000 حرفي وتأكيدات يومية</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-foreground">كل ما تحتاجه لمشروعك</h2>
          <p className="text-muted-foreground text-lg">أربع فئات رئيسية تغطي كافة احتياجات البناء والتعمير</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "مواد البناء", slug: "building-materials", desc: "إسمنت، آجر، حديد، وكل اللوازم", icon: Package, img: "/images/materials.png" },
            { title: "العتاد والأدوات", slug: "equipment-tools", desc: "خلاطات، رافعات، وآلات ثقيلة", icon: Truck, img: "/images/equipment.png" },
            { title: "الحرفيون", slug: "craftsmen", desc: "بناء، سباك، كهربائي، ودهان", icon: Hammer, img: "/images/craftsman.png" },
            { title: "تدوير النفايات", slug: "waste-recycling", desc: "التخلص من بقايا الورشات بطريقة ذكية", icon: Search, img: "/images/recycling.png" },
          ].map((cat, i) => (
            <motion.div 
              key={i} 
              {...fadeIn} 
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Link href={`/categories/${cat.slug}`}>
                <Card className="h-full border-2 border-primary/30 bg-card text-foreground hover:border-primary transition-all cursor-pointer group shadow-brutal overflow-hidden">
                  <div className="h-32 relative overflow-hidden">
                    <Image src={cat.img} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute bottom-2 right-4 w-12 h-12 rounded-xl flex items-center justify-center bg-primary text-primary-foreground font-bold shadow-lg group-hover:scale-105 transition-all">
                      <cat.icon size={26} />
                    </div>
                  </div>
                  <CardContent className="pt-4 text-right space-y-3 p-5">
                    <h3 className="text-xl font-black text-primary">{cat.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{cat.desc}</p>
                    <div className="text-primary text-sm font-bold flex items-center justify-start gap-1 opacity-90 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all pt-2">
                      استكشف الآن <ChevronRight size={16} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Inner Ad Banner 1 - Special Gold Promotion */}
      <InnerAdBanner 
        variant="gold"
        badge="عرض خاص للمقاولين"
        sponsorName="الشركة الوطنية لمواد البناء"
        title="خصومات تصل إلى 20% على طلبات الجملة للإسمنت والحديد"
        subtitle="استفد من التوصيل المباشر لكافة أرجاء الورشات والمشاريع الكبرى في 58 ولاية بأسعار تنافسية وضمان الجودة."
        highlightText="كود الخصم: TAKWIN2026 • لفترة محدودة"
        ctaText="اطلب العرض الآن"
        ctaLink="/categories/building-materials"
        image="/images/ad_materials.png"
      />

      {/* Stats Section */}
      <section className="bg-secondary text-foreground py-20 relative overflow-hidden diagonal-bg border-y-4 border-primary shadow-2xl">
        <div className="container mx-auto px-4 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: "مستخدم نشط", value: "+15,000", icon: Users },
            { label: "إعلان متاح", value: "+45,000", icon: Package },
            { label: "ولاية مغطاة", value: "58", icon: MapPin },
            { label: "مشروع مكتمل", value: "+10,000", icon: CheckCircle },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 p-6 rounded-2xl bg-card border border-primary/30 shadow-md">
              <stat.icon className="mx-auto text-primary mb-2" size={36} />
              <div className="text-4xl lg:text-5xl font-black text-primary">{stat.value}</div>
              <div className="text-foreground font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Inner Ad Banner 2 - Heavy Equipment Fleet */}
      <InnerAdBanner 
        variant="navy"
        badge="تأجير الحافلات والرافعات"
        sponsorName="أسطول الصحراء للمعدات الثقيلة"
        title="احجز أسطول الرافعات والحفارات الكبرى بأفضل أسعار التأجير اليومي والشهري"
        subtitle="صيانة دورية وسائقون محترفون جاهزون للعمل في أعتى المشاريع المعمارية مع توفير خدمات النقل السريع."
        highlightText="خصم 15% على عقود التأجير التي تتجاوز شهر"
        ctaText="استأجر الآن"
        ctaLink="/categories/equipment-tools"
        image="/images/ad_equipment.png"
      />

      {/* Why Us */}
      <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-card border border-primary/40 text-primary font-bold text-sm">
            مميزات المنصة
          </div>
          <h2 className="text-4xl font-black leading-tight text-foreground">لماذا تختار منصة بَنّاي؟</h2>
          <div className="space-y-6">
            {[
              { t: "الأمان والموثوقية", d: "جميع المزودين والحرفيين خاضعون لنظام تقييم ومراجعة دقيق." },
              { t: "تغطية وطنية شاملة", d: "خدماتنا متوفرة في جميع الولايات الـ 58." },
              { t: "سهولة التواصل", d: "نظام دردشة مباشر يسهل عليك التفاوض والاتفاق بسرعة." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-primary/20">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">{item.t}</h4>
                  <p className="text-muted-foreground">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/signup">
            <Button variant="brutal" size="lg">ابدأ الآن مجاناً</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 pt-12">
            <div className="aspect-[4/5] bg-card rounded-2xl border-2 border-primary/40 overflow-hidden shadow-brutal relative group">
               <Image src="/images/materials.png" fill className="object-cover group-hover:scale-105 transition-all duration-500" alt="مواد البناء" />
               <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
               <div className="absolute bottom-3 right-3 text-right">
                 <span className="bg-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-md shadow">جودة عالية</span>
                 <p className="text-foreground text-xs font-bold mt-1">موردون معتمدون</p>
               </div>
            </div>
            <div className="aspect-square bg-primary text-primary-foreground rounded-2xl border-3 border-foreground shadow-brutal flex items-center justify-center p-6 text-center">
               <div className="font-black text-2xl leading-snug">أكثر من 10,000 ورشة مكتملة</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-2xl border-2 border-primary/40 overflow-hidden shadow-brutal relative group">
               <Image src="/images/craftsman.png" fill className="object-cover group-hover:scale-105 transition-all duration-500" alt="حرفيون محترفون" />
               <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
               <div className="absolute bottom-3 right-3 text-right">
                 <span className="bg-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-md shadow">خبرة وتأكيد</span>
                 <p className="text-foreground text-xs font-bold mt-1">حرفيون ماهرون</p>
               </div>
            </div>
            <div className="aspect-[4/5] bg-card rounded-2xl border-2 border-primary/40 overflow-hidden shadow-brutal relative group">
               <Image src="/images/equipment.png" fill className="object-cover group-hover:scale-105 transition-all duration-500" alt="عتاد البناء" />
               <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
               <div className="absolute bottom-3 right-3 text-right">
                 <span className="bg-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-md shadow">عتاد ثقيل</span>
                 <p className="text-foreground text-xs font-bold mt-1">آلات ورافعات حديثة</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="bg-card text-foreground rounded-3xl p-6 sm:p-12 lg:p-24 text-center space-y-6 sm:space-y-8 relative overflow-hidden border-3 border-primary texture-grain texture-grid shadow-brutal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
          <h2 className="text-4xl lg:text-6xl font-black max-w-3xl mx-auto leading-tight text-primary">جاهز لبدء مشروعك القادم؟</h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">سواء كنت تبحث عن مواد، عتاد أو حرفيين، نحن هنا لمساعدتك.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button variant="brutal" size="lg" className="px-12">إنشاء حساب جديد</Button>
            </Link>
            <Button variant="outline" size="lg" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">اتصل بفريق المبيعات</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const MapPin = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
