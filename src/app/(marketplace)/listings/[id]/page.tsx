"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getListingById, createBooking, getExistingBooking, createNotification } from "@/lib/db";
import PaymentStep from "@/components/ui/PaymentStep";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWilayaName } from "@/lib/wilayas";

interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  wilaya: number;
  images: string[];
  user_id: string;
  created_at: string;
  price_type?: string;
  condition?: string;
  profiles: {
    full_name: string;
    rating_avg: number;
    memberSince?: string;
    avatar_url?: string;
    is_verified: boolean;
    created_at: string;
  };
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isContacting, setIsContacting] = useState(false);
  const [showContactPayment, setShowContactPayment] = useState(false);
  const [contactPaymentDone, setContactPaymentDone] = useState(false);
  const [contactUserRole, setContactUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const data = await getListingById(id);
        if (!data) throw new Error("Listing not found");
        setListing(data as unknown as Listing);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchListing();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [id]);

  const handleContact = async () => {
    if (!listing) return;
    setIsContacting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setContactUserRole(user.role);

      const existingBooking = await getExistingBooking(user.id, listing.user_id, listing.id);
      if (existingBooking) {
        router.push(user.role === 'PROVIDER' ? '/dashboard/provider/messages' : '/dashboard/client');
        return;
      }

      setShowContactPayment(true);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة الاتصال");
    } finally {
      setIsContacting(false);
    }
  };

  const finishContactPayment = async () => {
    if (!listing) return;
    const user = await getCurrentUser();
    if (!user) return;

    await createBooking({
      client_id: user.id,
      provider_id: listing.user_id,
      listing_id: listing.id,
      total_price: listing.price,
    });

    await createNotification({
      user_id: listing.user_id,
      type: "booking_request",
      message: `طلب جديد على إعلانك "${listing.title}"`,
      listing_id: listing.id,
    });

    setContactPaymentDone(true);
  };


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">الإعلان غير موجود</h1>
        <Link href="/listings">
          <Button variant="brutal">العودة للسوق</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 text-right" dir="rtl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronRight size={14} />
        <Link href="/listings" className="hover:text-primary transition-colors">السوق</Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images & Content */}
        <div className="lg:col-span-2 space-y-10 order-2 lg:order-1">
          {/* Image Gallery */}
          <div className="space-y-4">
             <div className="aspect-video rounded-3xl overflow-hidden border-4 border-black shadow-brutal relative group bg-secondary">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <Image 
                      src={listing.images[activeImage] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"} 
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                {listing.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImage(prev => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={() => setActiveImage(prev => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
             </div>
             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                {listing.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                      activeImage === i ? "border-primary shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt={`${listing.title} - ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
             </div>
          </div>

          {/* Main Info */}
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                   <h1 className="text-3xl md:text-4xl font-black leading-tight">{listing.title}</h1>
                   <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                         <MapPin size={16} className="text-primary" /> {getWilayaName(listing.wilaya)}
                      </div>
                      <div className="flex items-center gap-1">
                         <Clock size={16} className="text-primary" /> {new Date(listing.created_at).toLocaleDateString('ar-DZ')}
                      </div>
                      {listing.condition && (listing.category === 'MATERIAL' || listing.category === 'EQUIPMENT') && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                          {listing.condition === 'new' ? 'جديد' : 'مستعمل'}
                        </div>
                      )}
                   </div>
                </div>
                <div className="flex gap-2 mr-auto lg:mr-0">
                   <Button variant="ghost" className="p-3 bg-card border-2 border-border hover:border-primary"><Heart size={20} /></Button>
                   <Button variant="ghost" className="p-3 bg-card border-2 border-border hover:border-primary"><Share2 size={20} /></Button>
                </div>
             </div>

             <div className="p-4 sm:p-6 lg:p-8 bg-secondary rounded-3xl border border-border space-y-6">
                <h3 className="text-xl font-bold">الوصف</h3>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                  {listing.description || "لا يوجد وصف متوفر لهذا الإعلان."}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["توصيل متاح", "ضمان الجودة", "دفع آمن"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
                     <CheckCircle2 className="text-primary" size={20} />
                     <span className="font-bold">{feature}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Actions & Provider */}
        <aside className="space-y-8 order-1 lg:order-2">
           {/* Pricing Card */}
            <Card className="border-4 border-black shadow-brutal overflow-hidden bg-card">
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-1">
                   <span className="text-sm text-muted-foreground font-medium">السعر المعروض</span>
                   <div className="text-4xl font-black text-primary">
                     {listing.price.toLocaleString()} دج
                     {listing.price_type === 'day' && ' / يوم'}
                     {listing.price_type === 'kg' && ' / كغ'}
                     {listing.price_type === 'm3' && ' / م³'}
                   </div>
                </div>
                
                <div className="space-y-3">
                   <Button 
                    variant="brutal" 
                    className="w-full h-14 text-lg gap-3"
                    onClick={handleContact}
                    disabled={isContacting}
                   >
                      {isContacting ? <Loader2 className="animate-spin" /> : (
                        <>
                          <MessageSquare size={20} /> تواصل الآن
                        </>
                      )}
                   </Button>
                   <Button variant="outline" className="w-full h-14 text-lg gap-3 border-2">
                      <Phone size={20} /> عرض الهاتف
                   </Button>
                </div>

                <div className="pt-6 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
                   <ShieldCheck className="text-emerald-500" size={18} />
                   <span>نحن نضمن حماية معاملاتك عبر المنصة</span>
                </div>
             </CardContent>
           </Card>

           {/* Provider Info */}
            <Card className="border-2 border-border rounded-3xl bg-secondary overflow-hidden">
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <h4 className="font-bold">عن المزود</h4>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                      {listing.profiles?.full_name?.[0]}
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-lg">{listing.profiles?.full_name}</span>
                         {listing.profiles?.is_verified && <CheckCircle2 size={16} className="text-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground">عضو منذ {new Date(listing.profiles?.created_at || "").getFullYear()}</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-2xl border border-border text-center">
                       <div className="text-xl font-bold">{listing.profiles?.rating_avg || "0"}</div>
                       <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">التقييم</div>
                    </div>
                    <div className="p-4 bg-card rounded-2xl border border-border text-center">
                      <div className="text-xl font-bold">100%</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">سرعة الرد</div>
                   </div>
                </div>
             </CardContent>
           </Card>

           {/* Safety Tips */}
           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                 <Info size={18} /> نصائح للأمان
              </div>
              <ul className="text-xs text-amber-700 space-y-2 list-disc list-inside leading-relaxed text-right">
                 <li>لا تقم بتحويل الأموال مسبقاً قبل المعاينة.</li>
                 <li>قابل البائع في مكان عام وآمن.</li>
                 <li>تأكد من فحص المنتج جيداً قبل الاستلام.</li>
              </ul>
           </div>
         </aside>
      </div>

      <AnimatePresence>
        {showContactPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !isContacting) setShowContactPayment(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary" />
                  تواصل مع المزود
                </h3>
                <button onClick={() => setShowContactPayment(false)} className="p-1 hover:bg-primary/5 rounded-lg transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-6">
                {contactPaymentDone ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم التواصل بنجاح!</h3>
                    <p className="text-muted-foreground text-sm">يمكنك متابعة المحادثة مع المزود من صفحة الرسائل</p>
                    <Button variant="brutal" onClick={() => router.push(contactUserRole === 'PROVIDER' ? '/dashboard/provider/messages' : '/dashboard/client')}>
                      الذهاب إلى الرسائل
                    </Button>
                  </motion.div>
                ) : (
                  <PaymentStep
                    amount={listing?.price || 0}
                    onBack={() => setShowContactPayment(false)}
                    onSuccess={() => { finishContactPayment(); }}
                    onConfirm={async () => { await new Promise(r => setTimeout(r, 2000)); }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
