"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, MapPin, Tag, Filter, Star, Loader2, X, History, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import { getWilayaName, WILAYAS } from "@/lib/wilayas";
import { getListings } from "@/lib/db";

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

export default function ListingsPage() {
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

          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 space-y-4">
            <h4 className="font-bold text-primary">هل لديك شيء للبيع؟</h4>
            <p className="text-sm text-primary/80">انشر إعلانك الآن واحصل على عروض من آلاف المهتمين.</p>
            <Link href="/dashboard/provider/listings/new">
              <Button variant="brutal" className="w-full mt-4">أضف إعلان مجاناً</Button>
            </Link>
          </div>
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
    </div>
  );
}
