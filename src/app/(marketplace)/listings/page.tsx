"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Search, MapPin, Tag, Filter, Star, Loader2, X, History, Sparkles, Trash2,
  Send, CheckCircle2, AlertCircle, ImagePlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getWilayaName, WILAYAS } from "@/lib/wilayas";
import { getListings, createClientRequest } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveImages, rollbackImages } from "@/app/actions/images";
import { MAX_IMAGE_BYTES, prepareImages } from "@/lib/image-storage";

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  wilaya: number;
  images: string[];
  price_type?: string;
  condition?: string;
  profiles: {
    full_name: string;
    rating_avg: number;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'MATERIAL', label: 'مواد بناء' },
  { id: 'EQUIPMENT', label: 'آلات ومعدات' },
  { id: 'CRAFTSMAN', label: 'حرفيين' },
  { id: 'WASTE', label: 'نفايات بناء' },
];

const POPULAR_KEYWORDS = [
  "أسمنت",
  "آجر أحمر",
  "رمل مغسول",
  "حديد تسليح",
  "سقالات معدنية",
  "خلاطة خرسانة",
  "طلاء جدران",
  "بلاط وسيراميك"
];

const CUSTOM_REQUEST_URGENCY = [
  { id: "normal", label: "عادي" },
  { id: "urgent", label: "عاجل" },
  { id: "asap", label: "فوري جداً" },
];

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Suggestions & History State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("binaa_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom request modal state — the request is sent to the admin, who then
  // decides how to fulfil it.
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requestWilaya, setRequestWilaya] = useState("");
  const [requestUrgency, setRequestUrgency] = useState("normal");
  const [requestCommune, setRequestCommune] = useState("");
  const [requestBudgetMin, setRequestBudgetMin] = useState("");
  const [requestBudgetMax, setRequestBudgetMax] = useState("");
  const [requestPreferredDate, setRequestPreferredDate] = useState("");
  const [requestFiles, setRequestFiles] = useState<File[]>([]);
  const [requestPreviews, setRequestPreviews] = useState<string[]>([]);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const openRequestModal = () => {
    setRequestError("");
    setRequestSent(false);
    setRequestReference(null);
    setShowRequestModal(true);
  };

  const clearPreviews = () => {
    setRequestPreviews((urls) => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setRequestFiles([]);
  };

  const closeRequestModal = () => {
    if (requestSubmitting) return;
    setShowRequestModal(false);
    setRequestError("");
    setRequestSent(false);
    setRequestReference(null);
    clearPreviews();
  };

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUserRole(user?.role ?? null))
      .catch(() => setUserRole(null));
  }, []);

  // Resume a request draft after the login redirect. Only text fields can be
  // preserved across navigation; File objects cannot be serialized.
  useEffect(() => {
    const marker = sessionStorage.getItem("binaa_post_login_redirect");
    if (!marker?.includes("customRequest=1")) return;
    sessionStorage.removeItem("binaa_post_login_redirect");
    window.history.replaceState(null, "", "/listings");
    const raw = localStorage.getItem("binaa_custom_request_draft");
    if (!raw) return;

    let draft: Record<string, string>;
    try {
      draft = JSON.parse(raw) as Record<string, string>;
    } catch {
      localStorage.removeItem("binaa_custom_request_draft");
      return;
    }

    // Restore on the next task: setState must not run synchronously inside an
    // effect body, and React will then render the prefilled modal in one pass.
    const timer = setTimeout(() => {
      setRequestText(draft.text ?? "");
      setRequestWilaya(draft.wilaya ?? "");
      setRequestUrgency(draft.urgency ?? "normal");
      setRequestCommune(draft.commune ?? "");
      setRequestBudgetMin(draft.budgetMin ?? "");
      setRequestBudgetMax(draft.budgetMax ?? "");
      setRequestPreferredDate(draft.preferredDate ?? "");
      setShowRequestModal(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showRequestModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !requestSubmitting) {
        setShowRequestModal(false);
        setRequestError("");
        setRequestSent(false);
        setRequestReference(null);
        setRequestPreviews((urls) => {
          urls.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
        setRequestFiles([]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showRequestModal, requestSubmitting]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    if (requestFiles.length + incoming.length > 3) {
      setRequestError("يمكن إرفاق 3 صور كحد أقصى");
      return;
    }
    const invalid = incoming.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES
    );
    if (invalid) {
      setRequestError("الصور يجب أن تكون JPG أو PNG أو WebP أو GIF وبحجم أقل من 5 ميغابايت");
      return;
    }
    setRequestError("");
    setRequestFiles((current) => [...current, ...incoming]);
    setRequestPreviews((current) => [
      ...current,
      ...incoming.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveFile = (index: number) => {
    setRequestPreviews((urls) => {
      const target = urls[index];
      if (target) URL.revokeObjectURL(target);
      return urls.filter((_, i) => i !== index);
    });
    setRequestFiles((files) => files.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async () => {
    if (!requestText.trim()) {
      setRequestError("اكتب تفاصيل طلبك أولاً");
      return;
    }
    if (!requestWilaya) {
      setRequestError("الرجاء اختيار الولاية");
      return;
    }
    if (requestBudgetMin && requestBudgetMax && Number(requestBudgetMax) < Number(requestBudgetMin)) {
      setRequestError("الحد الأعلى للميزانية يجب أن يكون أكبر من الحد الأدنى");
      return;
    }
    setRequestError("");
    setRequestSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        localStorage.setItem(
          "binaa_custom_request_draft",
          JSON.stringify({
            text: requestText,
            wilaya: requestWilaya,
            urgency: requestUrgency,
            commune: requestCommune,
            budgetMin: requestBudgetMin,
            budgetMax: requestBudgetMax,
            preferredDate: requestPreferredDate,
          })
        );
        sessionStorage.setItem("binaa_post_login_redirect", "/listings?customRequest=1");
        setShowRequestModal(false);
        router.push("/login");
        return;
      }

      let uploadedUrls: string[] = [];
      if (requestFiles.length > 0) {
        const upload = await saveImages(await prepareImages(requestFiles), "requests");
        if (!upload.ok) {
          setRequestError(upload.error);
          return;
        }
        uploadedUrls = upload.urls;
      }

      const result = await createClientRequest({
        service_type: "custom",
        urgency: requestUrgency,
        wilaya: Number(requestWilaya),
        notes: requestText.trim(),
        commune: requestCommune.trim() || undefined,
        budget_min: requestBudgetMin ? Number(requestBudgetMin) : null,
        budget_max: requestBudgetMax ? Number(requestBudgetMax) : null,
        preferred_date: requestPreferredDate || null,
        attachments: uploadedUrls,
      });

      if (!result.ok) {
        if (uploadedUrls.length > 0) await rollbackImages(uploadedUrls);
        setRequestError(result.error);
        return;
      }

      localStorage.removeItem("binaa_custom_request_draft");
      setRequestReference(result.request.id.slice(0, 8));
      setRequestSent(true);
      clearPreviews();
    } catch (err) {
      console.error(err);
      setRequestError("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("binaa_recent_searches", JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("binaa_recent_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("binaa_recent_searches");
  };

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const filters: { category?: string; wilaya?: number; search?: string } = {};
        if (selectedCategory !== 'all') {
          filters.category = selectedCategory;
        }
        if (selectedWilaya !== 'all') {
          filters.wilaya = parseInt(selectedWilaya);
        }
        if (debouncedQuery) {
          filters.search = debouncedQuery;
        }
        const data = await getListings(filters);
        setListings(data as unknown as Listing[]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [selectedCategory, selectedWilaya, debouncedQuery, refreshKey]);

  const dynamicSuggestions = searchQuery.trim()
    ? listings
        .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(item => item.title)
        .slice(0, 5)
    : [];

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between text-right" dir="rtl">
        <div className="space-y-2 flex-1">
          <h1 className="text-4xl font-bold">استكشف سوق البناء</h1>
          <p className="text-muted-foreground text-lg">جد كل ما تحتاجه لمشروعك في مكان واحد</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto items-end">
          <div ref={containerRef} className="relative flex w-full md:w-auto gap-2 z-30">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                className="pr-12 pl-10 text-right h-12 bg-card border-2 border-border focus:border-primary focus:ring-0 transition-all rounded-xl text-sm" 
                placeholder="ابحث عن مواد، عتاد، أو حرفيين..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveSearchTerm(searchQuery);
                    setShowSuggestions(false);
                  }
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/5 rounded-full text-muted-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button 
              variant="brutal" 
              className="h-12 px-6" 
              onClick={() => {
                saveSearchTerm(searchQuery);
                setShowSuggestions(false);
                setRefreshKey(k => k + 1);
              }}
            >
              بحث
            </Button>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-full md:w-[464px] bg-card border border-border rounded-2xl shadow-xl p-4 space-y-4 text-right z-50 overflow-hidden"
                >
                  {/* Autocomplete / Match suggestions */}
                  {searchQuery.trim() && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-primary pb-1 border-b border-border">
                        <span>مقترحات مطابقة</span>
                        <Sparkles size={12} />
                      </div>
                      <div className="space-y-1">
                        {dynamicSuggestions.length > 0 ? (
                          dynamicSuggestions.map((title, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSearchQuery(title);
                                saveSearchTerm(title);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-right text-xs py-2 px-3 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors truncate block font-medium"
                            >
                              {title}
                            </button>
                          ))
                        ) : (
                          <div className="text-xs text-[var(--muted)] py-2 px-3">
                            لا توجد تطابقات دقيقة لـ &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-1 border-b border-border">
                        <button 
                          onClick={clearRecentSearches}
                          className="text-red-400 hover:text-red-500 font-normal transition-colors"
                        >
                          مسح الكل
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span>عمليات البحث الأخيرة</span>
                          <History size={12} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((term, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              setSearchQuery(term);
                              saveSearchTerm(term);
                              setShowSuggestions(false);
                            }}
                            className="flex items-center justify-between text-xs py-1.5 px-3 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors cursor-pointer group"
                          >
                            <button
                              onClick={(e) => removeRecentSearch(e, term)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-400/10 hover:text-red-500 rounded text-muted-foreground transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                            <span className="truncate font-medium">{term}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Keywords */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-muted-foreground pb-1 border-b border-border">
                      <span>الكلمات المفتاحية الشائعة</span>
                      <Sparkles size={12} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1 justify-end">
                      {POPULAR_KEYWORDS.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(word);
                            saveSearchTerm(word);
                            setShowSuggestions(false);
                          }}
                          className="text-[10px] font-medium bg-secondary hover:bg-primary/10 hover:text-primary text-foreground px-2.5 py-1 rounded-full transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Tag Badges */}
          <div className="flex flex-wrap gap-1.5 justify-end" dir="rtl">
            {POPULAR_KEYWORDS.slice(0, 5).map((word) => (
              <button
                key={word}
                onClick={() => {
                  setSearchQuery(word);
                  saveSearchTerm(word);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all border border-border",
                  searchQuery === word 
                    ? "bg-primary text-white" 
                    : "bg-card hover:bg-primary/10 hover:text-primary text-muted-foreground"
                )}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12" dir="rtl">
        {/* Sidebar Filters */}
        <aside className="space-y-8 text-right">
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Filter size={18} /> الفئات
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm text-right transition-all",
                    selectedCategory === cat.id 
                      ? "bg-primary text-white" 
                      : "bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <MapPin size={18} /> الولاية
            </h3>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full p-2.5 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors font-tajawal text-sm"
            >
              <option value="all">كل الولايات</option>
              {WILAYAS.map((w) => (
                <option key={w.id} value={w.id.toString()}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {userRole === "PROVIDER" ? (
            <div className="p-6 bg-primary rounded-2xl space-y-4 text-white">
              <h4 className="font-bold">هل لديك شيء للبيع؟</h4>
              <p className="text-sm text-white/80">
                انشر إعلانك الآن واحصل على عروض من آلاف المهتمين.
              </p>
              <Link href="/dashboard/provider/listings/new" className="block">
                <Button variant="secondary" className="w-full mt-4">
                  أضف إعلان مجاناً
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 space-y-4">
              <h4 className="font-bold text-primary">هل لديك طلب مخصص؟</h4>
              <p className="text-sm text-primary/80">أرسل طلبك الآن وسيتولى فريق الإدارة توفير ما تحتاجه.</p>
              <Button variant="brutal" className="w-full mt-4" onClick={openRequestModal}>
                <Send size={16} className="ml-2" />
                أرسل طلبك الآن
              </Button>
            </div>
          )}
        </aside>

        {/* Listings Grid */}
        <div className="lg:col-span-3 space-y-8">
           {isLoading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-primary" size={48} />
             </div>
           ) : listings.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing, i) => (
                  <motion.div 
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group overflow-hidden border-2 border-border hover:border-primary transition-all bg-card h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden relative">
                        <Image 
                          src={listing.images?.[0] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400"} 
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Tag size={12} /> {CATEGORIES.find(c => c.id === listing.category)?.label}
                        </div>
                        {listing.condition && (listing.category === 'MATERIAL' || listing.category === 'EQUIPMENT') && (
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                            {listing.condition === 'new' ? 'جديد' : 'مستعمل'}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <Star size={14} className="fill-current" /> {listing.profiles?.rating_avg || "جديد"}
                          </div>
                          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{listing.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin size={14} /> {getWilayaName(listing.wilaya)}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                           <div className="text-xl font-black text-foreground">
                             {listing.price} دج
                             {listing.price_type === 'day' && ' / يوم'}
                             {listing.price_type === 'kg' && ' / كغ'}
                             {listing.price_type === 'm3' && ' / م³'}
                           </div>
                           <Link href={`/listings/${listing.id}`}>
                             <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">تفاصيل</Button>
                           </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="text-center py-20 space-y-4 bg-background rounded-3xl border-2 border-dashed border-border">
               <div className="text-5xl">🔍</div>
               <h3 className="text-xl font-bold">لا توجد إعلانات حالياً</h3>
               <p className="text-muted-foreground">جرب تغيير الفلتر أو ابحث عن شيء آخر</p>
             </div>
           )}
        </div>
      </div>

      {/* Custom request modal — sent to the admin for review */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeRequestModal(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label="طلب مخصص"
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Send size={20} className="text-primary" />
                  طلب مخصص
                </h3>
                <button
                  onClick={closeRequestModal}
                  className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                  disabled={requestSubmitting}
                  aria-label="إغلاق"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {requestSent ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم إرسال طلبك!</h3>
                    <p className="text-muted-foreground text-sm">
                      ستراجع الإدارة طلبك وتتواصل معك لتوفير ما تحتاجه. يمكنك متابعة العرض
                      والرد عليه من لوحة حسابك.
                    </p>
                    {requestReference && (
                      <p className="text-xs font-bold text-primary" dir="ltr">
                        #{requestReference}
                      </p>
                    )}
                    <Button variant="outline" onClick={closeRequestModal}>
                      حسناً
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">
                        ماذا تحتاج بالضبط؟
                      </label>
                      <textarea
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        rows={4}
                        placeholder="مثال: أبحث عن مورد حديد تسليح 12 ملم بكمية 5 أطنان في وهران..."
                        className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">الولاية</label>
                        <select
                          value={requestWilaya}
                          onChange={(e) => setRequestWilaya(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">-- اختر الولاية --</option>
                          {WILAYAS.map((w) => (
                            <option key={w.id} value={String(w.id)}>{w.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">مستوى الاستعجال</label>
                        <div className="grid grid-cols-3 gap-2">
                          {CUSTOM_REQUEST_URGENCY.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => setRequestUrgency(u.id)}
                              className={cn(
                                "py-3 rounded-xl border-2 text-xs font-bold transition-all",
                                requestUrgency === u.id
                                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                                  : "bg-background border-border text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              {u.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-xs font-bold text-foreground">تفاصيل إضافية (اختياري)</p>
                      <p className="text-[11px] text-muted-foreground">
                        تساعد الإدارة على تقديم عرض أدق من أول مرة.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground">البلدية</label>
                          <Input
                            value={requestCommune}
                            onChange={(e) => setRequestCommune(e.target.value)}
                            placeholder="مثال: بئر الجير"
                            maxLength={100}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground">التاريخ المفضل</label>
                          <Input
                            type="date"
                            value={requestPreferredDate}
                            onChange={(e) => setRequestPreferredDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground">الميزانية من (دج)</label>
                          <Input
                            type="number"
                            min={0}
                            value={requestBudgetMin}
                            onChange={(e) => setRequestBudgetMin(e.target.value)}
                            placeholder="اختياري"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-foreground">إلى (دج)</label>
                          <Input
                            type="number"
                            min={0}
                            value={requestBudgetMax}
                            onChange={(e) => setRequestBudgetMax(e.target.value)}
                            placeholder="اختياري"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-foreground">
                          صور توضيحية (حتى 3 صور)
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-4 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                          <ImagePlus size={18} />
                          إضافة صور
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handleFilesSelected(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {requestPreviews.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {requestPreviews.map((url, index) => (
                              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                                <Image src={url} alt="معاينة" fill unoptimized className="object-cover" sizes="64px" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="absolute left-0.5 top-0.5 rounded-full bg-black/70 p-1 text-white hover:bg-red-500"
                                  aria-label="حذف الصورة"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {requestError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={16} />
                        {requestError}
                      </div>
                    )}

                    <Button
                      variant="brutal"
                      className="w-full h-14 text-lg"
                      disabled={requestSubmitting}
                      onClick={handleSubmitRequest}
                    >
                      {requestSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" /> جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={20} /> إرسال الطلب للإدارة
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
