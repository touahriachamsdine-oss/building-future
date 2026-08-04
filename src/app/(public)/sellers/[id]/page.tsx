"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Star, MapPin, CheckCircle, Phone, MessageSquare, Share2, ShieldCheck, Clock, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const SELLER_DATA = {
  "1": {
    name: "مؤسسة بن عمر لمواد البناء",
    type: "مورد مواد بناء",
    rating: 4.8,
    reviews: 124,
    location: "الجزائر العاصمة، الدار البيضاء",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=800&q=80",
    cover: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=1200&q=80",
    description: "نحن مؤسسة رائدة في توريد جميع أنواع مواد البناء من الإسمنت، الآجر، والحديد. نضمن لكم جودة عالية وأسعار تنافسية مع خدمة التوصيل السريع إلى جميع الورشات في الجزائر العاصمة وضواحيها.",
    joinedDate: "جانفي 2022",
    experience: "15 سنة",
    projects: "2,500+",
    stats: [
      { label: "معدل الرد", value: "98%" },
      { label: "التوصيل في الموعد", value: "95%" },
      { label: "الجودة", value: "4.9/5" },
    ],
    listings: [
      { id: "l1", title: "إسمنت لافارج 42.5", price: "950 دج", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
      { id: "l2", title: "آجر 12 ثقب (بالية)", price: "28,000 دج", image: "https://images.unsplash.com/photo-1590069230005-db393739a731?w=400&q=80" },
      { id: "l3", title: "حديد تسليح 12مم (قنطار)", price: "12,500 دج", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80" },
    ]
  },
  "2": {
    name: "مؤسسة التمديدات الكهربائية",
    type: "حرفي كهرباء",
    rating: 4.8,
    reviews: 73,
    location: "وهران، حي السلام",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    cover: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80",
    description: "حرفي متخصص في جميع أشغال الترصيص الصحي والتدفئة المركزية. خبرة طويلة في التركيب والصيانة. نضمن لكم عملاً متقناً ونظيفاً وبأسعار معقولة.",
    joinedDate: "مارس 2023",
    experience: "8 سنوات",
    projects: "450+",
    stats: [
      { label: "معدل الرد", value: "100%" },
      { label: "دقة المواعيد", value: "92%" },
      { label: "إتقان العمل", value: "5.0/5" },
    ],
    listings: [
      { id: "l4", title: "تركيب تدفئة مركزية شقة F4", price: "45,000 دج", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80" },
      { id: "l5", title: "تجديد شبكة مياه المطبخ", price: "12,000 دج", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80" },
    ]
  }
};

export default function SellerProfilePage() {
  const { id } = useParams();
  const seller = SELLER_DATA[id as keyof typeof SELLER_DATA] || SELLER_DATA["1"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pb-20">
        {/* Cover & Profile Image */}
        <div className="relative h-64 md:h-80 w-full">
          <Image src={seller.cover} alt="Cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column: Profile Card */}
            <div className="w-full md:w-80 shrink-0">
              <div className="bg-card text-card-foreground border-2 border-border rounded-3xl p-6 shadow-brutal text-center">
                <div className="relative w-32 h-32 mx-auto -mt-16 mb-4 rounded-2xl overflow-hidden border-4 border-card shadow-lg">
                  <Image src={seller.image} alt={seller.name} fill className="object-cover" />
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-2xl font-black">{seller.name}</h1>
                  {seller.isVerified && <CheckCircle className="text-primary" size={20} />}
                </div>
                <p className="text-muted-foreground font-medium mb-4">{seller.type}</p>

                <div className="flex items-center justify-center gap-1 mb-6">
                  <Star className="text-amber-500 fill-amber-500" size={18} />
                  <span className="font-bold text-lg">{seller.rating}</span>
                  <span className="text-muted-foreground">({seller.reviews} مراجعة)</span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-right px-2">
                    <MapPin className="text-primary shrink-0" size={18} />
                    <span>{seller.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-right px-2">
                    <Clock className="text-primary shrink-0" size={18} />
                    <span>عضو منذ {seller.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-right px-2">
                    <Award className="text-primary shrink-0" size={18} />
                    <span>خبرة {seller.experience}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-12 gap-2 text-lg font-bold" variant="brutal">
                    <Phone size={20} />
                    اتصل الآن
                  </Button>
                  <Button className="w-full h-12 gap-2 text-lg font-bold border-2 border-border" variant="outline">
                    <MessageSquare size={20} />
                    مراسلة
                  </Button>
                </div>
              </div>

              {/* Badges/Achievements */}
              <div className="mt-6 bg-card text-card-foreground border-2 border-border rounded-3xl p-6 shadow-brutal">
                <h3 className="font-bold mb-4">شارات الموثوقية</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 flex flex-col items-center text-center">
                    <ShieldCheck className="text-primary mb-2" size={24} />
                    <span className="text-[10px] font-bold text-primary">هوية محققة</span>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex flex-col items-center text-center">
                    <Award className="text-amber-500 mb-2" size={24} />
                    <span className="text-[10px] font-bold text-amber-500">أكثر مبيعاً</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Main Content */}
            <div className="flex-1 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {seller.stats.map((stat, i) => (
                  <div key={i} className="bg-card text-card-foreground border-2 border-border rounded-2xl p-6 shadow-brutal flex flex-col items-center">
                    <span className="text-3xl font-black text-primary mb-1">{stat.value}</span>
                    <span className="text-sm font-bold text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* About Section */}
              <div className="bg-card text-card-foreground border-2 border-border rounded-3xl p-8 shadow-brutal">
                <h2 className="text-2xl font-black mb-6">حول المزود</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {seller.description}
                </p>
              </div>

              {/* Products/Services Section */}
              <div>
                <div className="flex items-center justify-between mb-6 px-2">
                  <h2 className="text-2xl font-black">العروض والمنتجات</h2>
                  <Link href="#" className="text-primary font-bold hover:underline">مشاهدة الكل</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {seller.listings.map((listing) => (
                    <div key={listing.id} className="bg-card text-card-foreground border-2 border-border rounded-2xl overflow-hidden shadow-brutal hover:-translate-y-1 transition-all">
                      <div className="relative h-40">
                        <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold mb-2 truncate">{listing.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-black">{listing.price}</span>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Share2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-card text-card-foreground border-2 border-border rounded-3xl p-8 shadow-brutal">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">آراء العملاء</h2>
                  <Button variant="outline" className="border-2 border-border">أضف تقييماً</Button>
                </div>
                
                <div className="space-y-8">
                  {[1, 2].map((r) => (
                    <div key={r} className="border-b border-border last:border-0 pb-8 last:pb-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-muted rounded-full border border-border" />
                        <div>
                          <h4 className="font-bold">محمد علي</h4>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className="text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <span className="mr-auto text-xs text-muted-foreground">منذ أسبوعين</span>
                      </div>
                      <p className="text-muted-foreground">خدمة ممتازة وسريعة، المواد ذات جودة عالية والمعاملة كانت في قمة الاحترافية. أنصح الجميع بالتعامل معهم.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
