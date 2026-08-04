"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  BarChart3,
  Loader2,
  Package
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getProviderListings, deleteListing, updateListingAvailability } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  wilaya: number;
  created_at: string;
  views_count?: number;
  is_available: boolean;
  images: string[];
}

export default function ProviderListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await getProviderListings();
      setListings(data as unknown as Listing[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      fetchListings();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    
    setIsDeleting(id);
    try {
      const success = await deleteListing(id);
      if (!success) throw new Error("Failed to delete");
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const success = await updateListingAvailability(id, !currentStatus);
      if (!success) throw new Error("Failed to update availability");
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_available: !currentStatus } : l));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">إعلاناتي</h1>
          <p className="text-muted-foreground mt-1">إدارة وتحرير عروضك المنشورة على المنصة.</p>
        </div>
        <Link href="/dashboard/provider/listings/new">
          <Button variant="brutal" className="gap-2">
            <Plus size={20} /> إضافة إعلان جديد
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="group border-2 border-border hover:border-black transition-all shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full bg-card">
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    <Image 
                      src={listing.images?.[0] || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400"} 
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant={listing.is_available ? "success" : "outline"} className="border-2 border-black shadow-sm">
                        {listing.is_available ? "نشط" : "متوقف مؤقتاً"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4 flex-grow">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider">{listing.category}</div>
                      <h3 className="font-black text-lg leading-tight line-clamp-1">{listing.title}</h3>
                    </div>

                    <div className="flex items-center justify-between py-3 border-y border-border">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <BarChart3 size={14} className="text-muted-foreground" />
                        <span>{listing.views_count} مشاهدة</span>
                      </div>
                      <div className="text-lg font-black text-primary">
                        {listing.price?.toLocaleString()} دج
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/listings/${listing.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2 text-xs h-10">
                          <Eye size={14} /> معاينة
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="p-2 border-2 border-transparent hover:border-border"
                        onClick={() => toggleAvailability(listing.id, listing.is_available)}
                      >
                        <Edit3 size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="p-2 text-rose-500 hover:bg-rose-50 border-2 border-transparent hover:border-rose-100"
                        onClick={() => handleDelete(listing.id)}
                        disabled={isDeleting === listing.id}
                      >
                        {isDeleting === listing.id ? <Loader2 className="animate-spin size-4" /> : <Trash2 size={18} />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-background rounded-3xl p-20 text-center border-2 border-dashed border-border">
           <Package size={64} className="mx-auto text-muted-foreground mb-6" />
           <h2 className="text-2xl font-bold text-muted-foreground">ليس لديك أي إعلانات بعد</h2>
           <p className="text-muted-foreground mt-2 mb-10 max-w-md mx-auto">
             ابدأ بعرض خدماتك أو منتجاتك الآن للوصول إلى آلاف الزبائن في مجال البناء.
           </p>
           <Link href="/dashboard/provider/listings/new">
             <Button variant="brutal" size="lg" className="px-10">إنشاء أول إعلان</Button>
           </Link>
        </div>
      )}
    </div>
  );
}
