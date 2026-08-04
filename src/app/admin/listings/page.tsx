import { getAllListings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  Tag, 
  MapPin, 
  User,
  AlertTriangle,
  ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
  MATERIAL: 'مواد البناء',
  EQUIPMENT: 'العتاد',
  CRAFTSMAN: 'الحرفيون',
  WASTE: 'النفايات',
};

export default async function ListingModeration() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }
  const { listings, total } = await getAllListings(1, 50);
  const pendingCount = listings.filter(l => !l.is_available).length;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">اعتماد الإعلانات</h1>
          <p className="text-muted-foreground">مراجعة واعتماد الإعلانات الجديدة قبل نشرها للجمهور</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-500">
            <AlertTriangle size={18} />
            <span className="font-bold">{pendingCount} إعلان بانتظار المراجعة</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
        {listings.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            لا توجد إعلانات بعد
          </div>
        )}
        {listings.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border overflow-hidden flex flex-col md:flex-row h-full group">
               <div className="relative w-full md:w-48 lg:w-64 aspect-video md:aspect-auto bg-muted overflow-hidden shrink-0">
                 <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                   <ImageIcon size={32} />
                 </div>
                 <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2 rounded-lg">
                    <ImageIcon size={16} className="text-muted-foreground" />
                 </div>
               </div>

               <div className="flex-1 flex flex-col">
                  <CardHeader className="p-6">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                           <Tag size={12} /> {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                           <Clock size={12} /> {item.created_at}
                        </div>
                     </div>
                     <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                     <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                        <User size={14} /> {item.provider_name}
                     </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 space-y-4">
                     <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {item.wilaya && (
                          <div className="flex items-center gap-1">
                             <MapPin size={14} className="text-primary" /> ولاية {item.wilaya}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                           <span className="font-black text-foreground">{item.price.toLocaleString()} دج</span>
                           {item.price_type && <span className="text-xs text-muted-foreground">/{item.price_type === 'day' ? 'يوم' : item.price_type}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className={item.is_available ? 'text-emerald-500' : 'text-red-500'}>
                            {item.is_available ? 'منشور' : 'غير متاح'}
                          </span>
                        </div>
                     </div>
                  </CardContent>

                  <CardFooter className="p-6 mt-auto border-t border-border bg-muted/30 grid grid-cols-3 gap-2">
                     <Button variant="outline" className="gap-2">
                        <Eye size={16} /> معاينة
                     </Button>
                     <form action={`/api/admin/reject-listing`} method="POST" className="block">
                       <input type="hidden" name="listingId" value={item.id} />
                       <Button type="submit" variant="outline" className="w-full border-red-500/20 hover:bg-red-500/10 text-red-500 gap-2">
                         <XCircle size={16} /> رفض
                       </Button>
                     </form>
                     <form action={`/api/admin/approve-listing`} method="POST" className="block">
                       <input type="hidden" name="listingId" value={item.id} />
                       <Button type="submit" variant="brutal" className="w-full bg-emerald-600 border-0 shadow-none hover:bg-emerald-500 gap-2">
                         <CheckCircle2 size={16} /> قبول
                       </Button>
                     </form>
                  </CardFooter>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        إجمالي الإعلانات: {total}
      </div>
    </div>
  );
}
