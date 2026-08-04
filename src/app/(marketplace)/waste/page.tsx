"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { 
  Recycle, 
  MapPin, 
  Weight, 
  Trash2, 
  Info,
  CheckCircle2,
  Filter,
  Search,
  Loader2,
  Truck,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Leaf
} from "lucide-react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { getWasteListings, createWasteListing } from "@/lib/db";
import PaymentStep from "@/components/ui/PaymentStep";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getWilayaName, WILAYAS } from "@/lib/wilayas";

const WASTE_TYPES = [
  { id: 'all', title: 'الكل' },
  { id: 'iron', title: 'حديد' },
  { id: 'concrete', title: 'خرسانة' },
  { id: 'wood', title: 'خشب' },
  { id: 'soil', title: 'أتربة' },
  { id: 'bricks', title: 'آجر/ياجور' },
  { id: 'other', title: 'أخرى' },
];

interface WasteListing {
  id: string;
  waste_type: string;
  type: string;
  quantity: number;
  unit: string;
  asking_price: number;
  wilaya: number;
  images: string[];
  profiles: {
    full_name: string;
    is_verified: boolean;
  };
}

export default function WasteMarketplace() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [showWastePayment, setShowWastePayment] = useState(false);
  const WASTE_LISTING_PRICE = 1500;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    waste_type: "iron",
    type: "RECYCLING",
    quantity: "",
    unit: "kg",
    asking_price: "",
    pickup_available: false,
    wilaya: "1",
  });

  useEffect(() => {
    const fetchWasteListings = async () => {
       setIsLoading(true);
       try {
         const data = await getWasteListings(selectedType);
         setListings(data as unknown as WasteListing[]);
       } catch (err) {
         console.error(err);
       } finally {
         setIsLoading(false);
       }
     };

    const id = setTimeout(() => {
      fetchWasteListings();
    }, 0);
    return () => clearTimeout(id);
  }, [selectedType]);


  const filteredListings = listings.filter(l => {
    const matchesSearch = l.waste_type.includes(searchQuery) || l.type.includes(searchQuery);
    const matchesWilaya = selectedWilaya === 'all' || String(l.wilaya) === selectedWilaya;
    return matchesSearch && matchesWilaya;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert("يمكنك رفع 5 صور كحد أقصى");
      return;
    }
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `waste/${fileName}`;
      const { error } = await supabase.storage.from('listings').upload(filePath, file);
      if (error) continue;
      const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(filePath);
      urls.push(publicUrl);
    }
    return urls;
  };

  const resetForm = () => {
    setFormData({
      waste_type: "iron",
      type: "RECYCLING",
      quantity: "",
      unit: "kg",
      asking_price: "",
      pickup_available: false,
      wilaya: "1",
    });
    setSelectedFiles([]);
    setPreviews([]);
    setFormError("");
    setFormSuccess(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFormError("");

    const quantity = parseFloat(formData.quantity);
    if (!quantity || quantity <= 0) {
      setFormError("يرجى إدخال كمية صالحة");
      setSubmitting(false);
      return;
    }

    try {
      const imageUrls = await uploadImages();
      await createWasteListing({
        type: formData.type,
        waste_type: formData.waste_type,
        quantity,
        unit: formData.unit,
        asking_price: parseFloat(formData.asking_price) || 0,
        pickup_available: formData.pickup_available,
        wilaya: parseInt(formData.wilaya),
        images: imageUrls,
      });
      setShowWastePayment(true);
    } catch {
      setFormError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-24 text-right" dir="rtl">
      {/* Hero Section */}
      <section className="bg-card text-foreground py-20 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-primary/10 diagonal-bg opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm">
              <Recycle size={16} /> تدوير نفايات البناء
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight text-foreground">
              تخلص من <span className="text-primary">النفايات</span> بطريقة ذكية
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              سوق متكامل لتبادل نفايات البناء، الردم، والأتربة. وفر تكاليف النقل وساعد في حماية البيئة عبر إعادة الاستخدام.
            </p>
            <div className="flex flex-wrap gap-4">
               <Link href="/dashboard/provider/messages">
                <Button variant="brutal" size="lg">اطلب خدمة نقل</Button>
               </Link>
               <Button variant="outline" className="border-border hover:bg-muted font-bold" size="lg" onClick={() => { resetForm(); setShowForm(true); }}>أضف نفايات للتبادل</Button>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
               className="relative"
             >
                <Recycle size={300} className="text-primary/20" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters */}
        <aside className="space-y-8 order-2 lg:order-1">
           <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-foreground"><MapPin size={18} /> الولاية</h3>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">كل الولايات</option>
                {WILAYAS.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
           </div>

           <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-foreground"><Filter size={18} /> نوع النفايات</h3>
              <div className="flex flex-col gap-2">
                 {WASTE_TYPES.map(type => (
                   <button 
                     key={type.id}
                     onClick={() => setSelectedType(type.id)}
                     className={cn(
                       "px-4 py-3 rounded-xl text-right text-sm font-bold transition-all border",
                       selectedType === type.id 
                         ? "bg-primary text-primary-foreground border-primary shadow-md" 
                         : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                     )}
                   >
                     {type.title}
                   </button>
                 ))}
              </div>
           </div>

           <Card className="bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-100">
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                   <Info size={18} /> كيف يعمل؟
                </div>
                <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200">
                   إذا كان لديك بقايا ردم أو أتربة، يمكنك عرضها هنا لمن يحتاجها في الردم أو إعادة التدوير. هذا يقلل من تكاليف الرمي في المفرغات العمومية.
                </p>
             </CardContent>
           </Card>
        </aside>

        {/* Listings */}
        <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                 <Input 
                  className="h-14 pr-12 pl-4 bg-card border-border text-foreground text-right" 
                  placeholder="ابحث عن نوع معين من الردم أو الموقع..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <Button variant="brutal" className="h-14 px-10">بحث</Button>
           </div>

           {isLoading ? (
             <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
             </div>
           ) : filteredListings.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-border hover:border-emerald-500 transition-all group overflow-hidden bg-card shadow-sm hover:shadow-md">
                       <CardContent className="p-0">
                          <div className="p-6 space-y-6">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                   <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md inline-block">
                                      {item.waste_type}
                                   </div>
                                   <h3 className="text-xl font-bold text-foreground">{item.type}</h3>
                                </div>
                                <Trash2 size={24} className="text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                             </div>

                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground justify-end font-medium">
                                   {item.quantity} {item.unit} <Weight size={16} />
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground justify-end font-medium">
                                   {getWilayaName(item.wilaya)} <MapPin size={16} />
                                </div>
                             </div>

                             <div className="pt-6 border-t border-border flex items-center justify-between">
                                <div className="text-lg font-black text-foreground">
                                  {item.asking_price === 0 ? "مجاني" : `${item.asking_price.toLocaleString()} دج`}
                                </div>
                                <Link href="/dashboard/provider/messages">
                                  <Button size="sm" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-bold">تواصل</Button>
                                </Link>
                             </div>
                          </div>
                          <div className="px-6 py-3 bg-muted/40 border-t border-border flex items-center gap-2">
                             <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                                {item.profiles?.full_name?.[0]}
                             </div>
                             <span className="text-[11px] font-bold text-muted-foreground">{item.profiles?.full_name}</span>
                             {item.profiles?.is_verified && <CheckCircle2 size={14} className="text-primary mr-auto" />}
                          </div>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center space-y-4">
                <Truck size={48} className="mx-auto text-muted-foreground/40" />
                <h3 className="text-xl font-bold text-muted-foreground">لا توجد نتائج تطابق بحثك</h3>
                <Button variant="outline" onClick={() => { setSelectedType('all'); setSelectedWilaya('all'); }}>إعادة تعيين الفلاتر</Button>
             </div>
           )}
        </div>
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <CardHeader className="border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Leaf size={22} className="text-emerald-500" />
                  أضف نفاياتك
                </CardTitle>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-primary/5 rounded-lg transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {showWastePayment ? (
                  <PaymentStep
                    amount={WASTE_LISTING_PRICE}
                    label="سيظهر إعلانك في السوق قريباً"
                    onBack={() => setShowWastePayment(false)}
                    onSuccess={() => {
                      setShowWastePayment(false);
                      setFormSuccess(true);
                      setTimeout(() => {
                        setShowForm(false);
                        resetForm();
                        getWasteListings(selectedType).then(data => setListings(data as unknown as WasteListing[]));
                      }, 2000);
                    }}
                    onConfirm={async () => { await new Promise(r => setTimeout(r, 2000)); }}
                  />
                ) : formSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم الإعلان بنجاح!</h3>
                    <p className="text-muted-foreground text-sm">سيظهر إعلانك في السوق قريباً</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Waste Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">نوع النفايات</label>
                      <div className="grid grid-cols-3 gap-2">
                        {WASTE_TYPES.filter(t => t.id !== 'all').map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, waste_type: t.id }))}
                            className={cn(
                              "px-3 py-2.5 rounded-xl text-sm font-bold transition-all border text-center",
                              formData.waste_type === t.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border text-muted-foreground hover:border-primary/50"
                            )}
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Listing Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">نوع الطلب</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="DISPOSAL">تخلص من نفايات</option>
                        <option value="RECYCLING">إعادة تدوير</option>
                        <option value="RENOVATION">مخلفات ترميم</option>
                      </select>
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">الكمية</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="مثال: 10"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">الوحدة</label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="kg">كغ</option>
                          <option value="m3">م³</option>
                        </select>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">
                        السعر المطلوب <span className="text-muted-foreground font-normal">(اترك 0 إذا كان مجاناً)</span>
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="مثال: 5000"
                        value={formData.asking_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, asking_price: e.target.value }))}
                      />
                    </div>

                    {/* Pickup Available */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-foreground">متاح للنقل</span>
                        <p className="text-xs text-muted-foreground">يمكنك التوصيل أو نقل النفايات</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, pickup_available: !prev.pickup_available }))}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          formData.pickup_available ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform",
                          formData.pickup_available ? "translate-x-6" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>

                    {/* Wilaya */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">الولاية</label>
                      <select
                        value={formData.wilaya}
                        onChange={(e) => setFormData(prev => ({ ...prev, wilaya: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {WILAYAS.map((w) => (
                          <option key={w.id} value={String(w.id)}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">صور (اختياري)</label>
                      <div className="flex flex-wrap gap-2">
                        {previews.map((preview, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                            <NextImage src={preview} alt="" fill className="object-cover" />
                            <button
                              onClick={() => removeFile(i)}
                              className="absolute top-1 left-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                        {previews.length < 5 && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
                          >
                            <ImageIcon size={18} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">إضافة</span>
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={16} />
                        {formError}
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      variant="brutal"
                      className="w-full h-14 text-lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" /> جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload size={20} /> نشر الإعلان
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
