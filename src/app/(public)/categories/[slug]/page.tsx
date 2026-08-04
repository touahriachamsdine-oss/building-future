"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hammer, Truck, Package, Search, ChevronLeft, 
  Filter, SlidersHorizontal, MapPin, 
  Star, Clock, ShieldCheck, X, History, Sparkles, Trash2, Loader2,
  Send, CheckCircle2, AlertCircle, Building2, Droplets, Zap, PaintBucket, Layers, Wrench,
  Upload,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { WILAYAS, getWilayaName } from "@/lib/wilayas";
import { getListings, createClientRequest, type Listing } from "@/lib/db";
import PaymentStep from "@/components/ui/PaymentStep";
import { getCurrentUser } from "@/lib/auth";

const POPULAR_KEYWORDS_BY_SLUG: Record<string, string[]> = {
  "building-materials": [
    "أسمنت",
    "آجر أحمر",
    "رمل مغسول",
    "حديد تسليح",
    "طلاء جدران",
    "بلاط وسيراميك"
  ],
  "equipment-tools": [
    "خلاطة خرسانة",
    "رافعات",
    "مولدات كهربائية",
    "آلات الحفر",
    "سقالات"
  ],
  "craftsmen": [
    "بناء عام",
    "رصاص صحي",
    "كهربائي",
    "صباغ وديكور",
    "مركب البلاط"
  ],
  "waste-recycling": [
    "رفع الردم",
    "جمع المعادن",
    "تدوير البلاستيك",
    "بقايا خشب"
  ]
};

const SLUG_TO_CATEGORY: Record<string, string> = {
  "building-materials": "MATERIAL",
  "equipment-tools": "EQUIPMENT",
  "craftsmen": "CRAFTSMAN",
  "waste-recycling": "WASTE"
};

const WILAYA_OPTIONS = WILAYAS.map(w => getWilayaName(w.id));

const CATEGORIES_DATA = {
  "building-materials": {
    title: "مواد البناء",
    desc: "أفضل الموردين لمواد البناء الأساسية والتشطيبات",
    icon: Package,
    color: "blue",
    bgClass: "bg-blue-600 dark:bg-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/20",
    lightBg: "bg-gradient-to-br from-blue-500/10 via-background to-background border-b border-border",
    subcategories: [
      { name: "إسمنت ورمل", count: 1240 },
      { name: "حديد البناء", count: 850 },
      { name: "آجر وهوردي", count: 620 },
      { name: "دهانات وطلاء", count: 1100 },
      { name: "كهرباء عامة", count: 940 },
      { name: "سباكة وترصيص", count: 780 },
      { name: "خشب ونجارة", count: 450 },
      { name: "زجاج وألمنيوم", count: 320 },
      { name: "أخرى", count: 150 }
    ],
    filters: [
      { name: "الولاية", options: WILAYA_OPTIONS },
      { name: "نوع المادة", options: ["أساسي", "تكميلي", "تزيين"] },
      { name: "طريقة التوصيل", options: ["توصيل متوفر", "استلام من المستودع"] },
      { name: "السعر", options: ["أقل من 5000 دج", "5000 - 20000 دج", "أكثر من 20000 دج"] }
    ]
  },
  "equipment-tools": {
    title: "العتاد والأدوات",
    desc: "كراء وبيع كافة أنواع العتاد والأدوات المهنية للأشغال الكبرى والصغرى",
    icon: Truck,
    color: "orange",
    bgClass: "bg-orange-600 dark:bg-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500/20",
    lightBg: "bg-gradient-to-br from-orange-500/10 via-background to-background border-b border-border",
    subcategories: [
      { name: "خلاطات الإسمنت", count: 310 },
      { name: "رافعات وشاحنات", count: 180 },
      { name: "أدوات كهربائية", count: 540 },
      { name: "قوالب البناء", count: 220 },
      { name: "مولدات كهربائية", count: 140 },
      { name: "آلات الحفر", count: 95 },
      { name: "أخرى", count: 80 }
    ],
    filters: [
      { name: "الولاية", options: WILAYA_OPTIONS },
      { name: "نوع المعاملة", options: ["كراء يومي", "كراء شهري", "بيع"] },
      { name: "الحالة", options: ["جديد", "مستعمل"] }
    ]
  },
  "craftsmen": {
    title: "الحرفيون",
    desc: "تواصل مباشرة مع أمهر الحرفيين المعتمدين والمقيمين في منطقتك",
    icon: Hammer,
    color: "green",
    bgClass: "bg-emerald-600 dark:bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-green-500/20",
    lightBg: "bg-gradient-to-br from-emerald-500/10 via-background to-background border-b border-border",
    subcategories: [
      { name: "بناء عام", count: 2400 },
      { name: "رصاص صحي", count: 1800 },
      { name: "كهربائي معماري", count: 1600 },
      { name: "صباغ وديكور", count: 2100 },
      { name: "مركب البلاط", count: 1300 },
      { name: "نجار خشب", count: 900 },
      { name: "أخرى", count: 350 }
    ],
    filters: [
      { name: "الولاية", options: WILAYA_OPTIONS },
      { name: "سنوات الخبرة", options: ["مبتدئ", "متوسط (3-5 سنوات)", "خبير (+5 سنوات)"] },
      { name: "التقييم", options: ["4 نجوم فما فوق", "3 نجوم فما فوق"] }
    ]
  },
  "waste-recycling": {
    title: "تدوير النفايات",
    desc: "حلول ذكية للتخلص من بقايا ورشات البناء والمواد القابلة للتدوير",
    icon: Search,
    color: "purple",
    bgClass: "bg-purple-600 dark:bg-purple-500",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500/20",
    lightBg: "bg-gradient-to-br from-purple-500/10 via-background to-background border-b border-border",
    subcategories: [
      { name: "رفع الردم (التراب)", count: 420 },
      { name: "جمع المعادن", count: 280 },
      { name: "تدوير البلاستيك", count: 150 },
      { name: "جمع الورق والكارطون", count: 190 },
      { name: "نفايات الهدم", count: 310 },
      { name: "أخرى", count: 90 }
    ],
    filters: [
      { name: "الولاية", options: WILAYA_OPTIONS },
      { name: "حجم النفايات", options: ["حاوية صغيرة", "شاحنة كبيرة", "أكثر من شاحنة"] },
      { name: "الاستجابة", options: ["فورية", "خلال 24 ساعة", "موعد مبرمج"] }
    ]
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = CATEGORIES_DATA[slug as keyof typeof CATEGORIES_DATA];
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then(u => setCurrentUser(u)).catch(() => setCurrentUser(null));
  }, []);

  const requireAuth = (action: () => void) => {
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/categories/${slug}`)}`);
      return;
    }
    action();
  };
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`binaa_recent_searches_${slug}`);
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
    localStorage.setItem(`binaa_recent_searches_${slug}`, JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem(`binaa_recent_searches_${slug}`, JSON.stringify(updated));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(`binaa_recent_searches_${slug}`);
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

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [tebessaListings, setTebessaListings] = useState<Listing[]>([]);

  // Request service state (craftsmen only)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqService, setReqService] = useState<string | null>(null);
  const [reqTask, setReqTask] = useState<string | null>(null);
  const [reqUrgency, setReqUrgency] = useState("normal");
  const [reqWilaya, setReqWilaya] = useState("1");
  const [reqNotes, setReqNotes] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [reqError, setReqError] = useState("");
  const [showCraftPayment, setShowCraftPayment] = useState(false);
  const CRAFT_PRICE = 3500;

  // Waste pickup state (waste-recycling only)
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteForm, setWasteForm] = useState({
    waste_type: "iron",
    quantity: "",
    unit: "m3",
    wilaya: "1",
  });
  const [wasteFiles, setWasteFiles] = useState<File[]>([]);
  const [wastePreviews, setWastePreviews] = useState<string[]>([]);
  const [wasteSubmitting, setWasteSubmitting] = useState(false);
  const [wasteSent, setWasteSent] = useState(false);
  const [wasteError, setWasteError] = useState("");
  const [showWastePayment, setShowWastePayment] = useState(false);
  const wasteFileRef = useRef<HTMLInputElement>(null);

  // Listing request modal
  const [reqListing, setReqListing] = useState<Listing | null>(null);
  const [reqMessage, setReqMessage] = useState("");
  const [reqSending, setReqSending] = useState(false);
  const [reqStep_s, setReqStep_s] = useState<"form" | "payment" | "done">("form");

  const WASTE_TYPES = [
    { id: "iron", label: "حديد" },
    { id: "concrete", label: "خرسانة" },
    { id: "wood", label: "خشب" },
    { id: "soil", label: "أتربة/ردم" },
    { id: "bricks", label: "آجر" },
    { id: "plastic", label: "بلاستيك" },
    { id: "paper", label: "ورق/كرطون" },
    { id: "other", label: "أخرى" },
  ];

  const REQ_SERVICES = [
    { id: "masonry",     icon: Building2,   label: "بناء وتشييد" },
    { id: "plumbing",    icon: Droplets,    label: "سباكة" },
    { id: "electricity", icon: Zap,         label: "كهرباء" },
    { id: "painting",    icon: PaintBucket, label: "دهان وطلاء" },
    { id: "carpentry",   icon: Hammer,      label: "نجارة" },
    { id: "tiling",      icon: Layers,      label: "تبليط" },
    { id: "ironwork",    icon: Wrench,      label: "حدادة" },
  ];

  const TASKS_BY_SERVICE: Record<string, string[]> = {
    masonry: [
      "بناء جدار", "ترميم واجهة", "صب خرسانة", "بناء أساسات",
      "تركيب بلوك", "تجصيص", "عزل حراري", "بناء قوس",
    ],
    plumbing: [
      "تركيب حنفية", "تصليح تسريب", "تركيب سخان ماء", "تنظيف مجاري",
      "تركيب أنابيب", "تصليح مرحاض", "تركيب مغسلة", "كشف تسربات",
    ],
    electricity: [
      "تركيب أسلاك", "تصليح عطل", "تركيب مأخذ كهربائي", "تركيب لوحة كهربائية",
      "إنارة", "تركيب جرس", "تمديد كابل", "تصليح فيشة",
    ],
    painting: [
      "دهان جدران", "دهان سقف", "ورنيش خشب", "ديكور داخلي",
      "دهان خارجي", "تجديد دهان", "ورق جدران", "جرافيتو",
    ],
    carpentry: [
      "تركيب مطبخ", "تركيب خزائن", "تصليح أثاث", "تركيب أبواب",
      "تركيب شبابيك", "نجارة عامة", "تركيب باركيه", "تصليح خشب",
    ],
    tiling: [
      "تبليط أرضية", "تبليط جدران", "تركيب سيراميك", "إصلاح بلاط",
      "تركيب رخام", "تبليط حمام", "تبليط مطبخ", "تبليط خارجي",
    ],
    ironwork: [
      "تركيب سور", "لحام", "تركيب درابزين", "أبواب حديد",
      "شبابيك حديد", "هيكل معدني", "باب كراج", "سقالات حديدية",
    ],
  };

  const URGENCY_LEVELS = [
    { id: "normal", label: "عادي", color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "urgent", label: "عاجل", color: "text-orange-400", bg: "bg-orange-400/10" },
    { id: "asap",   label: "فوري", color: "text-red-400", bg: "bg-red-400/10" },
  ];

  const resetWasteForm = () => {
    setWasteForm({ waste_type: "iron", quantity: "", unit: "m3", wilaya: "1" });
    setWasteFiles([]);
    setWastePreviews([]);
    setWasteError("");
    setWasteSent(false);
  };

  const dbCategory = SLUG_TO_CATEGORY[slug];

  const MOCK_TEBESSA: Record<string, Listing[]> = useMemo(() => ({
    MATERIAL: [
      { id: "teb-mat-1", user_id: "", category: "MATERIAL", sub_category: "إسمنت", title: "إسمنت عالي الجودة", description: "", price: 1200, price_type: "fixed", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "مؤسسة تبسة للمواد", rating_avg: 4.7 } },
      { id: "teb-mat-2", user_id: "", category: "MATERIAL", sub_category: "حديد", title: "حديد تسليح 12 مم", description: "", price: 8500, price_type: "fixed", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "شركة تبسة للحديد", rating_avg: 4.5 } },
      { id: "teb-mat-3", user_id: "", category: "MATERIAL", sub_category: "طوب", title: "آجر أحمر 20×20×40", description: "", price: 450, price_type: "fixed", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "مصنع تبسة للآجر", rating_avg: 4.8 } },
      { id: "teb-mat-4", user_id: "", category: "MATERIAL", sub_category: "رمل", title: "رمل مغسول ومغربل", description: "", price: 3500, price_type: "m3", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "محجرة تبسة", rating_avg: 4.3 } },
    ],
    EQUIPMENT: [
      { id: "teb-eq-1", user_id: "", category: "EQUIPMENT", sub_category: "خلاطة", title: "خلاطة خرسانة 500 لتر", description: "", price: 3500, price_type: "day", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "مؤسسة تبسة للمعدات", rating_avg: 4.6 } },
      { id: "teb-eq-2", user_id: "", category: "EQUIPMENT", sub_category: "شاحنة", title: "شاحنة نقل مواد 10 طن", description: "", price: 12000, price_type: "day", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "شركة تبسة للنقل", rating_avg: 4.4 } },
      { id: "teb-eq-3", user_id: "", category: "EQUIPMENT", sub_category: "ضاغطة", title: "ضاغطة هواء كبيرة", description: "", price: 4500, price_type: "day", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "مؤسسة تبسة للمعدات", rating_avg: 4.5 } },
      { id: "teb-eq-4", user_id: "", category: "EQUIPMENT", sub_category: "رافعة", title: "رافعة برجية 30 م", description: "", price: 18000, price_type: "day", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "شركة تبسة للبناء", rating_avg: 4.7 } },
    ],
    WASTE: [
      { id: "teb-wa-1", user_id: "", category: "WASTE", sub_category: "رفع الردم", title: "رفع أتربة وردم منزل", description: "", price: 0, price_type: "m3", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "شركة تبسة للردم", rating_avg: 4.2 } },
      { id: "teb-wa-2", user_id: "", category: "WASTE", sub_category: "معادن", title: "جمع معادن حديد ونحاس", description: "", price: 0, price_type: "kg", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "مؤسسة تبسة للتدوير", rating_avg: 4.0 } },
      { id: "teb-wa-3", user_id: "", category: "WASTE", sub_category: "نفايات هدم", title: "رفع نفايات هدم وبناء", description: "", price: 0, price_type: "m3", wilaya: 12, images: ["/images/materials.png"], is_available: true, created_at: new Date().toISOString(), profiles: { full_name: "شركة تبسة للنظافة", rating_avg: 4.3 } },
    ],
  }), []);

  useEffect(() => {
    if (!dbCategory) return;

    const fetchCategoryListings = async () => {
      setIsLoadingListings(true);
      try {
        const filters: { category?: string; wilaya?: number; search?: string } = {
          category: dbCategory
        };

        // Extract wilaya from activeFilters
        const selectedWilayaName = activeFilters.find(f => WILAYA_OPTIONS.includes(f));
        if (selectedWilayaName) {
          const foundWilaya = WILAYAS.find(w => getWilayaName(w.id) === selectedWilayaName);
          if (foundWilaya) {
            filters.wilaya = foundWilaya.id;
          }
        }

        if (debouncedQuery) {
          filters.search = debouncedQuery;
        }

        const data = await getListings(filters);
        setListings(data as Listing[]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchCategoryListings();
  }, [slug, debouncedQuery, activeFilters, dbCategory]);

  // Fetch Tebessa-specific listings for non-craftsmen pages
  useEffect(() => {
    if (!dbCategory || dbCategory === 'CRAFTSMAN') return;
    getListings({ category: dbCategory, wilaya: 12 })
      .then(data => {
        if (data && data.length > 0) {
          setTebessaListings(data as Listing[]);
          return;
        }
        setTebessaListings(MOCK_TEBESSA[dbCategory] || []);
      })
      .catch(() => setTebessaListings(MOCK_TEBESSA[dbCategory] || []));
  }, [dbCategory, slug, MOCK_TEBESSA]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <div className={cn("w-full py-16 relative overflow-hidden", category.lightBg)}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-brutal border-2 border-primary/40", category.bgClass)}
            >
              <Icon size={48} />
            </motion.div>
            <div className="text-center md:text-right space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronLeft size={14} className="text-muted-foreground" />
                <span className={category.textClass}>{category.title}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground">تصفح {category.title}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">{category.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-card border-2 border-border rounded-2xl p-6 sticky top-24 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Filter size={18} className="text-primary" /> تصفية النتائج
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-10 text-primary hover:text-primary/80 hover:bg-muted" onClick={() => setActiveFilters([])}>مسح الكل</Button>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-3 bg-muted rounded-xl border border-border" dir="rtl">
                  {activeFilters.map((filterVal, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary shadow-sm"
                    >
                      {filterVal}
                      <button 
                        onClick={() => setActiveFilters(prev => prev.filter(f => f !== filterVal))}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {category.filters.map((filter, i) => (
                  <div key={i} className="space-y-3">
                    <h4 className="font-bold text-sm text-primary text-right">{filter.name}</h4>
                    {filter.name === "الولاية" ? (
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveFilters(prev => {
                            const filtered = prev.filter(f => !filter.options.includes(f));
                            if (val && val !== "all") {
                              return [...filtered, val];
                            }
                            return filtered;
                          });
                        }}
                        value={activeFilters.find(f => filter.options.includes(f)) || "all"}
                        className="w-full px-3 py-2 rounded-xl border-2 border-border bg-card text-card-foreground text-sm font-medium focus:border-primary focus:outline-none transition-colors text-right cursor-pointer"
                        dir="rtl"
                      >
                        <option value="all" className="bg-card text-card-foreground">كل الولايات</option>
                        {filter.options.map((opt, j) => (
                          <option key={j} value={opt} className="bg-card text-card-foreground">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-start md:justify-end" dir="rtl">
                        {filter.options.map((opt, j) => (
                          <button
                            key={j}
                            onClick={() => {
                              setActiveFilters(prev => 
                                prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
                              );
                            }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                              activeFilters.includes(opt) 
                                ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                                : "border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button variant="brutal" className="w-full mt-8 cursor-pointer">تطبيق الفلاتر</Button>
            </div>

            {/* Support Box */}
            <div className="bg-card border-2 border-border text-card-foreground rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <h4 className="font-bold text-primary">تحتاج لمساعدة؟</h4>
              <p className="text-sm text-muted-foreground">فريقنا متاح لمساعدتك في العثور على أفضل {category.title}.</p>
              <Button variant="outline" className="w-full text-foreground border-border hover:bg-muted">اتصل بنا</Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Category Search Bar (hidden on craftsmen) */}
            {category && slug !== 'craftsmen' && (
              <div className="flex flex-col gap-3 w-full items-end bg-card border-2 border-border p-6 rounded-2xl shadow-md" dir="rtl">
                <div className="flex items-center justify-between w-full pb-3 border-b border-border dark:border-white/5">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <Search size={18} /> بحث سريع في {category.title}
                  </h3>
                </div>
                <div ref={containerRef} className="relative flex w-full gap-2 z-30 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      className="pr-12 pl-10 text-right h-12 bg-muted/30 border-2 border-border focus:border-[var(--primary)] focus:ring-0 transition-all rounded-xl text-sm" 
                      placeholder={`ابحث عن ${category.title}...`} 
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-muted-foreground transition-colors"
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
                        className="absolute top-full right-0 mt-2 w-full bg-card border border-[var(--border)] rounded-2xl shadow-xl p-4 space-y-4 text-right z-50 overflow-hidden"
                      >
                        {/* Autocomplete / Match suggestions */}
                        {searchQuery.trim() && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-primary pb-1 border-b border-border dark:border-white/5">
                              <span>التصنيفات الفرعية المطابقة</span>
                              <Sparkles size={12} />
                            </div>
                            <div className="space-y-1">
                              {(() => {
                                const dynamicSuggestions = searchQuery.trim()
                                  ? category.subcategories
                                      .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                      .map(sub => sub.name)
                                      .slice(0, 5)
                                  : [];
                                return dynamicSuggestions.length > 0 ? (
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
                                  <div className="text-xs text-muted-foreground py-2 px-3">
                                    لا توجد تطابقات دقيقة لـ &quot;{searchQuery}&quot;
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pb-1 border-b border-border dark:border-white/5">
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
                        {(() => {
                          const popularKeywords = POPULAR_KEYWORDS_BY_SLUG[slug] || [];
                          return popularKeywords.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-muted-foreground pb-1 border-b border-border dark:border-white/5">
                                <span>أكثر الكلمات بحثاً</span>
                                <Sparkles size={12} />
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1 justify-end">
                                {popularKeywords.map((word, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      setSearchQuery(word);
                                      saveSearchTerm(word);
                                      setShowSuggestions(false);
                                    }}
                                    className="text-[10px] font-medium bg-secondary dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary text-foreground px-2.5 py-1 rounded-full transition-colors"
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Tag Badges */}
                {(() => {
                  const popularKeywords = POPULAR_KEYWORDS_BY_SLUG[slug] || [];
                  return popularKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-end mt-2" dir="rtl">
                      {popularKeywords.map((word) => (
                        <button
                          key={word}
                          onClick={() => {
                            setSearchQuery(word);
                            saveSearchTerm(word);
                          }}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold transition-all border border-border dark:border-white/5",
                            searchQuery === word 
                              ? "bg-primary text-white" 
                              : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                          )}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tebessa CTA — other pages */}
            {slug !== 'craftsmen' && (
              <section className="bg-gradient-to-br from-blue-500/10 via-background to-background border-2 border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-right">
                  <h3 className="text-2xl font-black text-foreground">في تبسة؟</h3>
                  <p className="text-muted-foreground">تصفح {category.title} المتوفرة في ولاية تبسة وتواصل مع المزودين المحليين</p>
                </div>
                <Link href={`/listings`}>
                  <Button variant="brutal" size="lg" className="shrink-0 gap-2 whitespace-nowrap">
                    <MapPin size={18} />
                    عرض {category.title} في تبسة
                  </Button>
                </Link>
              </section>
            )}

            {/* Waste Pickup CTA — waste-recycling only */}
            {slug === 'waste-recycling' && !showWasteModal && (
              <section className="bg-gradient-to-br from-purple-500/10 via-background to-background border-2 border-purple-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-right">
                  <h3 className="text-2xl font-black text-foreground">عندك نفايات؟</h3>
                  <p className="text-muted-foreground">صور لنا النفايات اللي تبي ترفعها ونرسل لك أقرب مزود</p>
                </div>
                <Button
                  variant="brutal"
                  size="lg"
                  className="shrink-0 gap-2 whitespace-nowrap"
                  onClick={() => requireAuth(() => setShowWasteModal(true))}
                >
                  <Upload size={18} />
                  أرفع صورة النفايات
                </Button>
              </section>
            )}

            {/* Request Service CTA — all pages */}
            {!showRequestModal && (
              <section className="bg-gradient-to-br from-emerald-500/10 via-background to-background border-2 border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-right">
                  <h3 className="text-2xl font-black text-foreground">
                    {slug === 'craftsmen' ? 'تحتاج حرفي؟' : 'ماذا تحتاج؟'}
                  </h3>
                  <p className="text-muted-foreground">
                    {slug === 'craftsmen'
                      ? 'اختر نوع الخدمة التي تحتاجها وسنرسل طلبك إلى أمهر الحرفيين'
                      : 'أخبرنا بما تبحث عنه وسنجده لك'
                    }
                  </p>
                </div>
                <Button
                  variant="brutal"
                  size="lg"
                  className="shrink-0 gap-2 whitespace-nowrap cursor-pointer"
                  onClick={() => requireAuth(() => setShowRequestModal(true))}
                >
                  <Send size={18} />
                  أرسل طلبك الآن
                </Button>
              </section>
            )}

            {/* Subcategories Grid — hidden on craftsmen */}
            {slug !== 'craftsmen' && (
            <section className="space-y-6">
              {(() => {
                const filteredSubcategories = category.subcategories.filter(sub => 
                  sub.name.toLowerCase().includes(debouncedQuery.toLowerCase())
                );
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">التصنيفات الفرعية</h2>
                      <div className="text-sm text-muted-foreground">متوفر {filteredSubcategories.length} فئات</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredSubcategories.length > 0 ? (
                          filteredSubcategories.map((sub) => (
                            <motion.button
                              key={sub.name}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              whileHover={{ scale: 1.02, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                             className="bg-card border-2 border-border hover:border-primary p-4 rounded-2xl text-right transition-all group shadow-md cursor-pointer"
                            >
                              <div className="font-bold text-foreground group-hover:text-primary transition-colors">{sub.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">{sub.count} إعلان</div>
                            </motion.button>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12 text-muted-foreground">
                            لا توجد فئات فرعية تطابق خيارات البحث الخاصة بك.
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                );
              })()}
            </section>
            )}

            {/* Featured Listings — hidden on craftsmen */}
            {category && slug !== 'craftsmen' && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">إعلانات مختارة</h2>
                  <div className="flex items-center gap-4">
                     <div className="flex bg-muted p-1 rounded-lg">
                        <button className="p-2 bg-background rounded-md shadow-sm"><SlidersHorizontal size={16} /></button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                  {isLoadingListings ? (
                    <div className="col-span-full flex justify-center items-center py-12">
                      <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                  ) : listings.length > 0 ? (
                    listings.map((item) => {
                      const formattedPrice = item.price_type === 'day' 
                        ? `${item.price} دج / يوم` 
                        : (item.price_type as string) === 'hour'
                        ? `${item.price} دج / ساعة`
                        : `${item.price} دج`;
                      const imageSrc = item.images?.[0] || '/images/materials.png';
                      const rating = item.profiles?.rating_avg || '4.8';
                      const timeStr = 'منذ فترة';
                      const wilayaName = getWilayaName(item.wilaya || 16);

                      return (
                         <Card key={item.id} className="group overflow-hidden border-2 border-border hover:border-primary transition-all bg-card text-card-foreground shadow-brutal">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                             <Image src={imageSrc} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                             <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                             <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-black shadow-md">
                               عروض مميزة
                             </div>
                          </div>
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-primary">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold text-muted-foreground">{rating}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock size={12} /> {timeStr}
                              </div>
                            </div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin size={14} className="text-primary" /> {wilayaName}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="text-lg font-black text-primary">{formattedPrice}</div>
                              <div className="flex gap-2">
                                <Link href={`/listings/${item.id}`}>
                                  <Button variant="outline" size="sm" className="gap-1 cursor-pointer border-border">
                                    التفاصيل <ChevronLeft size={14} />
                                  </Button>
                                </Link>
                                <Button
                                  variant="brutal"
                                  size="sm"
                                  className="gap-1 cursor-pointer"
                                  onClick={() => requireAuth(() => { setReqListing(item as unknown as Listing); setReqMessage(""); setReqStep_s("form"); })}
                                >
                                  <Send size={14} />
                                  اطلب
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      لا توجد إعلانات تطابق خيارات البحث الخاصة بك في هذا القسم.
                    </div>
                  )}
                </div>
                
                <div className="text-center pt-8">
                  <Button variant="outline" size="lg" className="px-12">تحميل المزيد من الإعلانات</Button>
                </div>
              </section>
            )}

            {/* Tebessa Featured Listings — non-craftsmen pages */}
            {slug !== 'craftsmen' && dbCategory && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin size={22} className="text-primary" />
                    إعلانات مختارة في تبسة
                  </h2>
                  <Link href="/listings">
                    <Button variant="outline" size="sm" className="gap-1">
                      عرض الكل <ChevronLeft size={14} />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                  {tebessaListings.length > 0 ? (
                    tebessaListings.map((item) => {
                      const formattedPrice = item.price_type === 'day' 
                        ? `${item.price} دج / يوم` 
                        : (item.price_type as string) === 'hour'
                        ? `${item.price} دج / ساعة`
                        : `${item.price} دج`;
                      const imageSrc = item.images?.[0] || '/images/materials.png';
                      const rating = item.profiles?.rating_avg || '4.8';
                      const timeStr = 'منذ فترة';
                      const wilayaName = getWilayaName(item.wilaya || 12);

                      return (
                        <Card key={item.id} className="group overflow-hidden border-2 border-blue-500/20 hover:border-blue-500 transition-all bg-card text-card-foreground shadow-brutal">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <Image src={imageSrc} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-black shadow-md flex items-center gap-1">
                              <MapPin size={10} /> تبسة
                            </div>
                          </div>
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-primary">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold text-muted-foreground">{rating}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock size={12} /> {timeStr}
                              </div>
                            </div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-blue-500 transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin size={14} className="text-blue-500" /> {wilayaName}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="text-lg font-black text-primary">{formattedPrice}</div>
                              <div className="flex gap-2">
                                <Link href={`/listings/${item.id}`}>
                                  <Button variant="outline" size="sm" className="gap-1 cursor-pointer border-border">
                                    التفاصيل <ChevronLeft size={14} />
                                  </Button>
                                </Link>
                                <Button
                                  variant="brutal"
                                  size="sm"
                                  className="gap-1 cursor-pointer"
                                  onClick={() => requireAuth(() => { setReqListing(item as unknown as Listing); setReqMessage(""); setReqStep_s("form"); })}
                                >
                                  <Send size={14} />
                                  اطلب
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <MapPin size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                      <p>لا توجد إعلانات متوفرة في تبسة حالياً</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* ── Service Request Modal ──────────────── */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !reqSubmitting) setShowRequestModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Hammer size={20} className="text-emerald-500" />
                  {slug === 'craftsmen' ? 'طلب خدمة حرفي' : 'أخبرنا بماذا تبحث'}
                </h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                  disabled={reqSubmitting}
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {showCraftPayment ? (
                  <PaymentStep
                    amount={CRAFT_PRICE}
                    label="سيتم مراجعة طلبك وإرساله إلى المزودين المختصين"
                    onBack={() => setShowCraftPayment(false)}
                    onSuccess={() => { setShowCraftPayment(false); setReqSent(true); }}
                    onConfirm={async () => { await new Promise(r => setTimeout(r, 2000)); }}
                  />
                ) : reqSent ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم إرسال طلبك!</h3>
                    <p className="text-muted-foreground text-sm">سيتم مراجعة طلبك وإرساله إلى المزودين المختصين</p>
                    <Button variant="outline" onClick={() => { setShowRequestModal(false); setReqSent(false); }}>
                      حسناً
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {/* Step indicator */}
                    <div className="flex gap-2 mb-4">
                      <div className={cn(
                        "flex-1 h-1.5 rounded-full transition-all",
                        reqService ? "bg-emerald-500" : "bg-muted"
                      )} />
                      <div className={cn(
                        "flex-1 h-1.5 rounded-full transition-all",
                        reqTask && reqService ? "bg-emerald-500" : "bg-muted"
                      )} />
                    </div>

                    {/* Step 1: Pick Service */}
                    {!reqService && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">اختر نوع الخدمة</label>
                        <div className="space-y-2">
                          {REQ_SERVICES.map(s => {
                            const Icon = s.icon;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => { setReqService(s.id); setReqTask(null); }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/50 hover:text-foreground transition-all text-right group"
                              >
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                  <Icon size={22} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-foreground">{s.label}</div>
                                  <div className="text-xs text-muted-foreground">{TASKS_BY_SERVICE[s.id]?.length || 0} مهمة متاحة</div>
                                </div>
                                <ChevronLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Pick Task + Details */}
                    {reqService && (
                      <div className="space-y-5">
                        {/* Back button */}
                        <button
                          type="button"
                          onClick={() => { setReqService(null); setReqTask(null); }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          <ChevronLeft size={14} />
                          العودة لاختيار الخدمة
                        </button>

                        {/* Tasks grid */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-foreground">
                            {REQ_SERVICES.find(s => s.id === reqService)?.label}
                            <span className="text-muted-foreground font-normal text-xs mr-2">— اختر المهمة المطلوبة</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(TASKS_BY_SERVICE[reqService] || []).map(task => (
                              <button
                                key={task}
                                type="button"
                                onClick={() => setReqTask(reqTask === task ? null : task)}
                                className={cn(
                                  "px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-right",
                                  reqTask === task
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                )}
                              >
                                {task}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Urgency (only shown after task selected) */}
                        {reqTask && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-foreground">مستوى الاستعجال</label>
                              <div className="flex gap-2">
                                {URGENCY_LEVELS.map(u => (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setReqUrgency(u.id)}
                                    className={cn(
                                      "flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all",
                                      reqUrgency === u.id
                                        ? `${u.bg} ${u.color} border-current scale-105 shadow-md`
                                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                  >
                                    {u.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-foreground">الولاية</label>
                              <select
                                value={reqWilaya}
                                onChange={(e) => setReqWilaya(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                {WILAYAS.map(w => (
                                  <option key={w.id} value={String(w.id)}>{w.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-foreground">تفاصيل إضافية <span className="text-muted-foreground font-normal">(اختياري)</span></label>
                              <textarea
                                value={reqNotes}
                                onChange={(e) => setReqNotes(e.target.value)}
                                rows={2}
                                placeholder="صف ما تحتاجه بالضبط..."
                                className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground"
                              />
                            </div>

                            {/* Error */}
                            {reqError && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                                <AlertCircle size={16} />
                                {reqError}
                              </div>
                            )}

                            <Button
                              variant="brutal"
                              className="w-full h-14 text-lg"
                              disabled={!reqTask || reqSubmitting}
                              onClick={async () => {
                                setReqSubmitting(true);
                                setReqError("");
                                try {
                                  const user = await getCurrentUser();
                                  if (!user) {
                                    router.push('/login');
                                    return;
                                  }
                                  await createClientRequest({
                                    service_type: reqService!,
                                    urgency: reqUrgency,
                                    wilaya: Number(reqWilaya),
                                    notes: reqNotes.trim() || undefined,
                                  });
                                  setShowCraftPayment(true);
                                } catch {
                                  setReqError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
                                } finally {
                                  setReqSubmitting(false);
                                }
                              }}
                            >
                              {reqSubmitting ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 size={20} className="animate-spin" /> جاري الإرسال...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Send size={20} /> إرسال الطلب
                                </span>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Waste Pickup Modal (waste-recycling only) ──────────────── */}
      <AnimatePresence>
        {showWasteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !wasteSubmitting) { resetWasteForm(); setShowWasteModal(false); } }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Trash2 size={20} className="text-purple-500" />
                  طلب رفع نفايات
                </h3>
                <button
                  onClick={() => { if (!wasteSubmitting) { resetWasteForm(); setShowWasteModal(false); } }}
                  className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                  disabled={wasteSubmitting}
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {showWastePayment ? (
                  <PaymentStep
                    amount={2000}
                    label="سيتم مراجعة طلبك وإرساله إلى مزودي الخدمة في منطقتك"
                    onBack={() => setShowWastePayment(false)}
                    onSuccess={() => { setShowWastePayment(false); setWasteSent(true); }}
                    onConfirm={async () => { await new Promise(r => setTimeout(r, 2000)); }}
                  />
                ) : wasteSent ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم إرسال طلبك!</h3>
                    <p className="text-muted-foreground text-sm">سيتم مراجعة طلبك وإرساله إلى مزودي الخدمة في منطقتك</p>
                    <Button variant="outline" onClick={() => { resetWasteForm(); setShowWasteModal(false); }}>
                      حسناً
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {/* Waste Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">نوع النفايات</label>
                      <div className="grid grid-cols-2 gap-2">
                        {WASTE_TYPES.map(wt => (
                          <button
                            key={wt.id}
                            type="button"
                            onClick={() => setWasteForm(p => ({ ...p, waste_type: wt.id }))}
                            className={cn(
                              "px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-right",
                              wasteForm.waste_type === wt.id
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                          >
                            {wt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity + Unit */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">الكمية التقريبية</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={wasteForm.quantity}
                          onChange={(e) => setWasteForm(p => ({ ...p, quantity: e.target.value }))}
                          placeholder="مثال: 5"
                          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">الوحدة</label>
                        <select
                          value={wasteForm.unit}
                          onChange={(e) => setWasteForm(p => ({ ...p, unit: e.target.value }))}
                          className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="m3">متر مكعب (م³)</option>
                          <option value="kg">كيلوغرام (كغ)</option>
                          <option value="ton">طن</option>
                          <option value="truck">شاحنة</option>
                        </select>
                      </div>
                    </div>

                    {/* Wilaya */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">الولاية</label>
                      <select
                        value={wasteForm.wilaya}
                        onChange={(e) => setWasteForm(p => ({ ...p, wilaya: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-right font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {WILAYAS.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">صور النفايات <span className="text-muted-foreground font-normal">(اختياري - حتى 5 صور)</span></label>
                      <div
                        onClick={() => wasteFileRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">اضغط لاختيار صور</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG - مقاس 5MB كحد أقصى لكل صورة</p>
                      </div>
                      <input
                        ref={wasteFileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length + wasteFiles.length > 5) {
                            alert("يمكنك رفع 5 صور كحد أقصى");
                            return;
                          }
                          const oversized = files.some(f => f.size > 5 * 1024 * 1024);
                          if (oversized) {
                            alert("حجم الصورة يجب ألا يتجاوز 5 ميغابايت");
                            return;
                          }
                          const newPreviews = files.map(f => URL.createObjectURL(f));
                          setWastePreviews(prev => [...prev, ...newPreviews]);
                          setWasteFiles(prev => [...prev, ...files]);
                        }}
                      />
                      {wastePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {wastePreviews.map((preview, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                              <Image src={preview} alt="" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setWasteFiles(prev => prev.filter((_, idx) => idx !== i));
                                  setWastePreviews(prev => prev.filter((_, idx) => idx !== i));
                                }}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    {wasteError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={16} />
                        {wasteError}
                      </div>
                    )}

                    <Button
                      variant="brutal"
                      className="w-full h-14 text-lg"
                      disabled={!wasteForm.quantity || parseFloat(wasteForm.quantity) <= 0 || wasteSubmitting}
                      onClick={async () => {
                        setWasteSubmitting(true);
                        setWasteError("");
                        try {
                          await new Promise(r => setTimeout(r, 1000));
                          setShowWastePayment(true);
                        } catch {
                          setWasteError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
                        } finally {
                          setWasteSubmitting(false);
                        }
                      }}
                    >
                      {wasteSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" /> جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={20} /> إرسال طلب الرفع
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Listing Request Modal ──────────────── */}
      <AnimatePresence>
        {reqListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !reqSending) setReqListing(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Send size={20} className="text-primary" />
                  طلب شراء / إيجار
                </h3>
                <button
                  onClick={() => { if (!reqSending) setReqListing(null); }}
                  className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                  disabled={reqSending}
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Step: Form */}
                {reqStep_s === "form" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted relative shrink-0">
                        {reqListing.images?.[0] && (
                          <Image src={reqListing.images[0]} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">{reqListing.title}</p>
                        <p className="text-sm text-primary font-black">{reqListing.price.toLocaleString()} دج</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-foreground">رسالتك إلى المزود</label>
                      <textarea
                        value={reqMessage}
                        onChange={(e) => setReqMessage(e.target.value)}
                        rows={3}
                        placeholder="أنا مهتم بهذا الإعلان، هل لا يزال متوفراً؟"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {reqError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={16} />
                        {reqError}
                      </div>
                    )}

                    <Button
                      variant="brutal"
                      className="w-full h-14 text-lg"
                      disabled={reqSending}
                      onClick={async () => {
                        setReqSending(true);
                        setReqError("");
                        try {
                          await new Promise(r => setTimeout(r, 1000));
                          setReqStep_s("payment");
                        } catch {
                          setReqError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
                        } finally {
                          setReqSending(false);
                        }
                      }}
                    >
                      {reqSending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={20} className="animate-spin" /> جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={20} /> إرسال الطلب
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {/* Step: Payment */}
                {reqStep_s === "payment" && (
                  <PaymentStep
                    amount={reqListing.price}
                    label="تم تأكيد طلبك وستصلك الإشعارات عبر البريد والموقع"
                    onBack={() => setReqStep_s("form")}
                    onSuccess={() => setReqStep_s("done")}
                    onConfirm={async () => {
                      await new Promise(r => setTimeout(r, 2000));
                    }}
                  />
                )}

                {/* Step: Done */}
                {reqStep_s === "done" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">تم إرسال طلبك!</h3>
                    <p className="text-muted-foreground text-sm">سيتم إشعار المزود بطلبك ويمكنك متابعة المحادثة من صفحة الرسائل</p>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button variant="brutal" onClick={() => setReqListing(null)}>
                        حسناً
                      </Button>
                      <Link href="/dashboard/client">
                        <Button variant="outline">الرسائل</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
