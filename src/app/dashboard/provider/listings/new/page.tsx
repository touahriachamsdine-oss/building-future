"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Upload, Info, CheckCircle2, ChevronRight, Image as ImageIcon, Loader2, X } from "lucide-react";
import NextImage from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/db";
import { WILAYAS } from "@/lib/wilayas";

const STEPS = [
  { id: 1, title: "المعلومات الأساسية", description: "أدخل اسم المنتج والنوع" },
  { id: 2, title: "الصور والوصف", description: "أضف صوراً جذابة ووصفاً دقيقاً" },
  { id: 3, title: "السعر والموقع", description: "حدد السعر والولاية المتاحة" },
  { id: 4, title: "المراجعة والنشر", description: "تأكد من البيانات قبل الإرسال" },
];

const CATEGORIES = [
  { id: 'MATERIAL', label: 'مواد بناء' },
  { id: 'EQUIPMENT', label: 'آلات ومعدات' },
  { id: 'CRAFTSMAN', label: 'حرفيين' },
  { id: 'WASTE', label: 'نفايات بناء' },
];

export default function NewListingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "MATERIAL",
    subCategory: "",
    description: "",
    price: "",
    price_type: "fixed",
    condition: "new",
    wilaya: "1",
    images: [] as string[],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
    setUploading(true);
    
    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error } = await supabase.storage
          .from('listings')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }
      return urls;
    } catch (err) {
      console.error("Storage upload error:", err);
      // Fallback: if bucket doesn't exist or error, return empty
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      await createListing({
        title: formData.title,
        category: formData.category,
        sub_category: formData.subCategory,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        price_type: formData.price_type,
        condition: (formData.category === 'MATERIAL' || formData.category === 'EQUIPMENT') ? formData.condition : undefined,
        wilaya: parseInt(formData.wilaya),
        images: imageUrls.length > 0 ? imageUrls : formData.images,
      });

      router.push('/dashboard/provider/listings');
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء نشر الإعلان. يرجى التأكد من ملء جميع الحقول.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center px-4 md:px-0">
         <div className="text-right">
            <h1 className="text-3xl font-bold">إضافة إعلان جديد</h1>
            <p className="text-muted-foreground mt-1">اتبع الخطوات لإدراج منتجك أو خدمتك في السوق</p>
         </div>
         <Button variant="ghost" className="flex gap-2" onClick={() => window.history.back()}>
            <ArrowRight size={18} />
            إلغاء
         </Button>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-4 gap-4 px-4 md:px-0">
         {STEPS.map((step) => (
           <div key={step.id} className="relative">
              <div className={cn(
                "h-2 rounded-full transition-all duration-500",
                currentStep >= step.id ? "bg-primary" : "bg-secondary"
              )} />
              <div className="mt-3 text-right hidden md:block">
                 <span className={cn(
                   "text-[10px] font-bold uppercase tracking-wider",
                   currentStep === step.id ? "text-primary" : "text-muted-foreground"
                 )}>الخطوة {step.id}</span>
                 <p className={cn(
                   "text-xs font-bold truncate",
                   currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                 )}>{step.title}</p>
              </div>
           </div>
         ))}
      </div>

      <Card className="border-0 shadow-xl shadow-black/5 overflow-hidden mx-4 md:mx-0 bg-card">
        <CardContent className="p-6 md:p-10">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8 text-right"
               dir="rtl"
             >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold">عنوان الإعلان</label>
                          <Input 
                            placeholder="مثال: إسمنت لافارج عالي الجودة" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="text-right"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold">التصنيف</label>
                          <select 
                            className="w-full h-12 px-4 rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-right"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                             {CATEGORIES.map(cat => (
                               <option key={cat.id} value={cat.id}>{cat.label}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold">التصنيف الفرعي</label>
                       <Input 
                        placeholder="مثال: إسمنت، حديد، طوب..." 
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                        className="text-right"
                       />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-sm font-bold">صور المنتج (حتى 5 صور)</label>
                       <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                       />
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all bg-secondary"
                          >
                             <Upload className="text-muted-foreground" size={24} />
                             <span className="text-[10px] font-bold">رفع صورة</span>
                          </button>
                          
                          {previews.map((preview, i) => (
                            <div key={i} className="aspect-square rounded-2xl relative group overflow-hidden border-2 border-border">
                               <NextImage src={preview} alt={`Preview ${i + 1}`} fill className="object-cover" />
                               <button 
                                onClick={() => removeFile(i)}
                                className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <X size={12} />
                               </button>
                            </div>
                          ))}

                          {Array.from({ length: 4 - previews.length }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                               <ImageIcon size={32} />
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold">الوصف الكامل</label>
                       <textarea 
                         rows={5}
                         className="w-full p-4 rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-right"
                         placeholder="اشرح بالتفصيل مواصفات المنتج وشروط البيع..."
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-sm font-bold">السعر (دج)</label>
                               <Input 
                                 placeholder="0.00" 
                                 type="number" 
                                 value={formData.price}
                                 onChange={(e) => setFormData({...formData, price: e.target.value})}
                                 className="text-right"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-bold">نوع السعر</label>
                               <select 
                                 className="w-full h-12 px-4 rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-right"
                                 value={formData.price_type}
                                 onChange={(e) => setFormData({...formData, price_type: e.target.value})}
                               >
                                  <option value="fixed">سعر ثابت / كلي</option>
                                  <option value="day">يومي (كراء)</option>
                                  <option value="kg">للكيلوغرام</option>
                                  <option value="m3">للمتر المكعب</option>
                               </select>
                            </div>
                         </div>

                         {(formData.category === 'MATERIAL' || formData.category === 'EQUIPMENT') && (
                            <div className="space-y-2">
                               <label className="text-sm font-bold">الحالة</label>
                               <select 
                                 className="w-full h-12 px-4 rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-right"
                                 value={formData.condition}
                                 onChange={(e) => setFormData({...formData, condition: e.target.value})}
                               >
                                  <option value="new">جديد</option>
                                  <option value="used">مستعمل</option>
                               </select>
                            </div>
                         )}

                         <div className="space-y-2">
                            <label className="text-sm font-bold">الولاية</label>
                            <select 
                              className="w-full h-12 px-4 rounded-xl border border-border bg-secondary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-right"
                              value={formData.wilaya}
                              onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                            >
                               {WILAYAS.map((w) => (
                                 <option key={w.id} value={String(w.id)}>{w.name}</option>
                               ))}
                            </select>
                         </div>
                      </div>
                      <div className="bg-secondary p-6 rounded-2xl border border-border space-y-4">
                         <div className="flex gap-3 text-right">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                تحديد السعر بدقة يساعد في ظهور إعلانك للمهتمين بشكل أسرع. يمكنك ترك السعر فارغاً إذا كنت تريد التفاوض لاحقاً.
                            </p>
                            <Info size={18} className="text-primary shrink-0" />
                         </div>
                      </div>
                   </div>
                )}

                {currentStep === 4 && (
                  <div className="text-center py-10 space-y-6">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 size={40} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-bold">جاهز للنشر؟</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">بمجرد النشر، سيتم مراجعة إعلانك من قبل الإدارة قبل ظهوره للعامة.</p>
                     </div>
                  </div>
                )}
             </motion.div>
           </AnimatePresence>
        </CardContent>
        <div className="px-6 md:px-10 py-6 bg-secondary border-t border-border flex justify-between items-center">
           <Button 
             variant="ghost" 
             onClick={prevStep}
             disabled={currentStep === 1 || isLoading || uploading}
             className="flex gap-2"
           >
              السابق
           </Button>
           <Button 
             variant="brutal" 
             onClick={currentStep === 4 ? handlePublish : nextStep}
             disabled={isLoading || uploading}
             className="flex gap-2 min-w-[140px]"
           >
              {isLoading || uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {currentStep === 4 ? "نشر الإعلان" : "المتابعة"}
                  <ChevronRight size={18} className="rotate-180" />
                </>
              )}
           </Button>
        </div>
      </Card>
    </div>
  );
}
