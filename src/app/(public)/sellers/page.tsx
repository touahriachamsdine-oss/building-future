"use client";

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Star, MapPin, CheckCircle, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WILAYAS } from "@/lib/wilayas";

const SELLERS = [
  {
    id: "1",
    name: "مؤسسة بن عمر لمواد البناء",
    type: "MATERIAL_SUPPLIER",
    rating: 4.8,
    reviews: 124,
    location: "الجزائر العاصمة",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=400&q=80",
    category: "مواد البناء",
  },
  {
    id: "2",
    name: "مؤسسة التمديدات الكهربائية",
    type: "CRAFTSMAN",
    rating: 4.8,
    reviews: 73,
    location: "وهران",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    category: "الحرفيون",
  },
  {
    id: "3",
    name: "شركة النور للأدوات الكهربائية",
    type: "EQUIPMENT_RENTAL",
    rating: 4.6,
    reviews: 42,
    location: "سطيف",
    isVerified: false,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
    category: "العتاد والأدوات",
  },
  {
    id: "4",
    name: "جمعية تدوير الخشب والبلاستيك",
    type: "WASTE_RECYCLER",
    rating: 4.7,
    reviews: 31,
    location: "قسنطينة",
    isVerified: true,
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
    category: "تدوير النفايات",
  },
];

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-4">دليل المزودين والحرفيين</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              تصفح قائمة الشركاء الموثوقين لدينا، من موردي المواد إلى الحرفيين المحترفين في جميع أنحاء الوطن.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="brutal" className="h-12 px-8">كن مزوداً معنا</Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-brutal mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="ابحث عن مزود، حرفي، أو شركة..." 
                className="pr-12 h-14 text-lg border-2 border-border bg-background text-foreground"
              />
            </div>
            <div>
              <select className="w-full h-14 bg-background text-foreground border-2 border-border rounded-xl px-4 font-medium outline-none focus:ring-2 ring-primary">
                <option>كل الفئات</option>
                <option>مواد البناء</option>
                <option>العتاد والأدوات</option>
                <option>الحرفيون</option>
                <option>تدوير النفايات</option>
              </select>
            </div>
            <div>
              <select className="w-full h-14 bg-background text-foreground border-2 border-border rounded-xl px-4 font-medium outline-none focus:ring-2 ring-primary">
                <option value="all">كل الولايات</option>
                {WILAYAS.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SELLERS.map((seller) => (
            <Link key={seller.id} href={`/sellers/${seller.id}`} className="group">
              <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-brutal hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-48 w-full">
                  <Image 
                    src={seller.image} 
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-card/90 text-foreground backdrop-blur-md px-3 py-1 rounded-full border border-border text-xs font-bold shadow-sm">
                    {seller.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl truncate flex-1 text-foreground">{seller.name}</h3>
                    {seller.isVerified && (
                      <CheckCircle className="text-blue-500 fill-blue-500/10" size={18} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-500 fill-amber-500" size={14} />
                      <span className="font-bold text-foreground">{seller.rating}</span>
                      <span>({seller.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{seller.location}</span>
                    </div>
                  </div>

                  <Button className="w-full h-12 border-2 border-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    عرض الملف الشخصي
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
