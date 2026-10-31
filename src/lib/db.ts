'use server';

import { query } from './neon';
import { getCurrentUser, requireAdmin } from './auth';

export type Listing = {
  id: string;
  user_id: string;
  category: 'MATERIAL' | 'EQUIPMENT' | 'CRAFTSMAN' | 'WASTE';
  sub_category?: string;
  title: string;
  description: string;
  price: number;
  price_type?: 'fixed' | 'day' | 'kg' | 'm3' | null;
  condition?: 'new' | 'used' | null;
  wilaya: number;
  images: string[];
  is_available: boolean;
  views_count?: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    rating_avg?: number;
  };
};


const MOCK_LISTINGS: Listing[] = [
  {
    id: "mock-1",
    user_id: "usr-1",
    category: "MATERIAL",
    sub_category: "إسمنت ورمل",
    title: "أسمنت بورتلاندي ممتاز CPJ-42.5 (كيس 50 كغ)",
    description: "أسمنت بورتلاند عالي الجودة مطابق للمواصفات المعمارية الوطنية. مثالي للبلاطات، الأعمدة، وأشغال الخرسانة المسلحة. التوصيل متوفر في ورشات الجزائر العاصمة وبومرداس والبليدة.",
    price: 890,
    price_type: "fixed",
    condition: "new",
    wilaya: 16,
    images: ["/images/materials.png", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 342,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      full_name: "مؤسسة بن عمر لمواد البناء",
      avatar_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=150&q=80",
      rating_avg: 4.9
    }
  },
  {
    id: "mock-2",
    user_id: "usr-2",
    category: "MATERIAL",
    sub_category: "حديد البناء",
    title: "حديد بناء حلزوني عالي التماسك (FeE500) 12 ملم",
    description: "حديد بناء حلزوني ممتاز للخرسانة المسلحة، متوفر بجميع الأقطار (8، 10، 12، 14، 16 ملم). شهادة المطابقة وشهادة الفحص التقني متوفرة.",
    price: 115000,
    price_type: "fixed",
    condition: "new",
    wilaya: 31,
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600", "/images/materials.png"],
    is_available: true,
    views_count: 512,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    profiles: {
      full_name: "شركة النور للحديد والصلب",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      rating_avg: 4.8
    }
  },
  {
    id: "mock-3",
    user_id: "usr-3",
    category: "EQUIPMENT",
    sub_category: "رافعات وشاحنات",
    title: "رافعة هيدروليكية كوماتسو 50 طن مع سائق محترف",
    description: "كراء رافعة كوماتسو 50 طن حمولة قصوى، أذرع ممتدة حتى 42 متراً. متوفرة للمشاريع المعمارية والأشغال العمومية بحراش والشراقة والدويرا.",
    price: 25000,
    price_type: "day",
    condition: "used",
    wilaya: 16,
    images: ["/images/equipment.png", "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 620,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    profiles: {
      full_name: "أسطول المتين للمعدات الثقيلة",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      rating_avg: 5.0
    }
  },
  {
    id: "mock-4",
    user_id: "usr-4",
    category: "EQUIPMENT",
    sub_category: "خلاطات الإسمنت",
    title: "خلاطة خرسانة احترافية سعة 350 لتر بمحرك ديزل",
    description: "خلاطة بيتون ممتازة 350L سهلة التناقل بالورشات، اقتصادية في استهلاك الوقود. خيار الكراء اليومي أو الأسبوعي.",
    price: 4500,
    price_type: "day",
    condition: "used",
    wilaya: 19,
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=600", "/images/equipment.png"],
    is_available: true,
    views_count: 280,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    profiles: {
      full_name: "مؤسسة الهضاب لكراء الأدوات",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
      rating_avg: 4.7
    }
  },
  {
    id: "mock-5",
    user_id: "usr-5",
    category: "CRAFTSMAN",
    sub_category: "بناء عام",
    title: "معلم بناء وتلبيس خبير (أكثر من 15 سنة خبرة)",
    description: "تطبيق كافة أنواع الأعمدة، البلاطات، والتلبيس الداخلي والخارجي مع الالتزام التام بالآجال المحددة والمقاييس الهندسية المعمول بها.",
    price: 3500,
    price_type: "day",
    condition: null,
    wilaya: 25,
    images: ["/images/craftsman.png", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 890,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    profiles: {
      full_name: "كمال للترصيص والبناء",
      avatar_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&q=80",
      rating_avg: 4.9
    }
  },
  {
    id: "mock-6",
    user_id: "usr-6",
    category: "CRAFTSMAN",
    sub_category: "كهربائي معماري",
    title: "كهربائي معماري وصناعي معتمد لشبكات التيار القوي والضعيف",
    description: "دراسة وتأطير خزان الكابلوهات، الكاميرات، الأنترفون، وشبكات الكهرباء الذكية للشقق، الفيلات والورشات التجارية.",
    price: 3000,
    price_type: "day",
    condition: null,
    wilaya: 9,
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600", "/images/craftsman.png"],
    is_available: true,
    views_count: 410,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    profiles: {
      full_name: "أمين للكهرباء العامة",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
      rating_avg: 4.8
    }
  },
  {
    id: "mock-7",
    user_id: "usr-7",
    category: "WASTE",
    sub_category: "رفع الردم (التراب)",
    title: "شاحنة رفع وتخلّص من ردم الخرسانة والأتربة",
    description: "توفير خدمة تفريغ الردم وبقايا الهدم والحفر من الورشات عبر شاحنات حمولة 15 طن مع استخراج رخص المفرغة العمومية المعتمدة.",
    price: 12000,
    price_type: "fixed",
    condition: null,
    wilaya: 16,
    images: ["/images/recycling.png", "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 310,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    profiles: {
      full_name: "مؤسسة النظافة والبيئة والردم",
      avatar_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=150&q=80",
      rating_avg: 4.7
    }
  },
  {
    id: "mock-8",
    user_id: "usr-8",
    category: "MATERIAL",
    sub_category: "آجر وهوردي",
    title: "آجر حمراء ممتازة 8 ثقوب (كمية 1000 قطعة)",
    description: "آجر أحمر طين نقي عازل للحرارة والصوت، جودة عالية ومطابق للقياسات الرسمية. متوفر التوصيل المباشر بالشاحنات المعلقة.",
    price: 32000,
    price_type: "fixed",
    condition: "new",
    wilaya: 19,
    images: ["/images/materials.png", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 450,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    profiles: {
      full_name: "مصنع الوفاق للآجر الأحمر",
      avatar_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=150&q=80",
      rating_avg: 4.9
    }
  },
  {
    id: "mock-9",
    user_id: "usr-9",
    category: "MATERIAL",
    sub_category: "طلاء وعزل",
    title: "طلاء مائي خارجي مقاوم للعوامل الجوية (سطل 25 كغ)",
    description: "دهان واجهات خارجي من النوع الفاخر، مقاوم للأشعة فوق البنفسجية والرطوبة. حماية تدوم لأكثر من 10 سنوات متوفر بجميع الألوان.",
    price: 7800,
    price_type: "fixed",
    condition: "new",
    wilaya: 13,
    images: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600", "/images/materials.png"],
    is_available: true,
    views_count: 320,
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    profiles: {
      full_name: "مؤسسة الأطلس للدهانات والعزل",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
      rating_avg: 4.7
    }
  },
  {
    id: "mock-10",
    user_id: "usr-10",
    category: "EQUIPMENT",
    sub_category: "سقالات وسلالم",
    title: "سقالات معدنية نمطية (أشغال البناء والواجهات 500 م²)",
    description: "كراء سقالات أنبوبية مطابقة لشروط السلامة والأمان المهني. تشمل المنصات السفلية والسلالم الداخلية الجانبية.",
    price: 18000,
    price_type: "day",
    condition: "used",
    wilaya: 23,
    images: ["/images/equipment.png", "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 530,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    profiles: {
      full_name: "عنابة لسقالات ومعدات السلامة",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80",
      rating_avg: 4.8
    }
  },
  {
    id: "mock-11",
    user_id: "usr-11",
    category: "EQUIPMENT",
    sub_category: "مولدات كهربائية",
    title: "مولد كهربائي صناعي كوماتسو 100 kVA بمحرك ديزل",
    description: "مولد قدرة عالية مناسب لتزويد الورشات والمصانع بالتيار الكهربائي المستمر. كاتم للصوت واقتصادي في الوقود.",
    price: 15000,
    price_type: "day",
    condition: "used",
    wilaya: 30,
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600", "/images/equipment.png"],
    is_available: true,
    views_count: 290,
    created_at: new Date(Date.now() - 3600000 * 54).toISOString(),
    profiles: {
      full_name: "ورقلة للحلول الصناعية والطاقة",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
      rating_avg: 4.9
    }
  },
  {
    id: "mock-12",
    user_id: "usr-12",
    category: "CRAFTSMAN",
    sub_category: "ترصيص وتدفئة",
    title: "حرفي ترصيص صحي وتدفئة مركزية خبير (Plombier Chauffagiste)",
    description: "تركيب شبكات المياه، الغاز، التدفئة المركزية والتدفئة الأرضية (Chauffage au sol). ضمان كامل مع المتابعة الدورية.",
    price: 3500,
    price_type: "day",
    condition: null,
    wilaya: 42,
    images: ["/images/craftsman.png", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"],
    is_available: true,
    views_count: 760,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    profiles: {
      full_name: "مراد للترصيص الحراري والتكييف",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
      rating_avg: 5.0
    }
  },
  {
    id: "mock-13",
    user_id: "usr-13",
    category: "CRAFTSMAN",
    sub_category: "جبس وتهيئة داخلية",
    title: "مختص ديكور جبس بورد وفواصل بلاكو بلاتر (Placo Plâtre BA13)",
    description: "تركيب أسقف معلقة مدرجة، إضاءة مخفية (Led Strip)، ديكورات شاشات البلازما، وتقسيم المكاتب والمحلات التجارية.",
    price: 2800,
    price_type: "day",
    condition: null,
    wilaya: 6,
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600", "/images/craftsman.png"],
    is_available: true,
    views_count: 640,
    created_at: new Date(Date.now() - 3600000 * 66).toISOString(),
    profiles: {
      full_name: "فن الجبس والديكور العصري",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      rating_avg: 4.8
    }
  },
  {
    id: "mock-14",
    user_id: "usr-14",
    category: "WASTE",
    sub_category: "تدوير البلاستيك والخشب",
    title: "طبالي خشبية للتخزين وشحن مواد البناء (Palettes en bois)",
    description: "طبالي خشب مقاسات استاندار (120x80 سم) حالة ممتازة، صالحة لنقل وحفظ الأكياس والمعدات في الورشات والمخازن.",
    price: 450,
    price_type: "fixed",
    condition: null,
    wilaya: 16,
    images: ["/images/recycling.png"],
    is_available: true,
    views_count: 380,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    profiles: {
      full_name: "مركز التدوير المتكامل",
      avatar_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=150&q=80",
      rating_avg: 4.6
    }
  }
];

export async function getListings(filters?: { category?: string; wilaya?: number; search?: string }) {
  try {
    let sql = `
      SELECT l.*, p.full_name, p.avatar_url, p.rating_avg 
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.id
      WHERE l.is_available = TRUE
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.category && filters.category !== 'all' && filters.category !== 'الكل') {
      sql += ` AND l.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.wilaya && !isNaN(filters.wilaya)) {
      sql += ` AND l.wilaya = $${paramIndex}`;
      params.push(filters.wilaya);
      paramIndex++;
    }

    if (filters?.search) {
      sql += ` AND l.title ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY l.created_at DESC';

    const rows = await query(sql, params);

    // Also fetch waste listings from waste_listings table if category matches
    let wasteItems: Listing[] = [];
    const isWasteCategory = filters?.category === 'WASTE';
    const isAllCategories = !filters?.category || filters.category === 'all' || filters.category === 'الكل';
    if (isWasteCategory || isAllCategories) {
      try {
        let wSql = `
          SELECT w.*, p.full_name, p.avatar_url, p.rating_avg
          FROM waste_listings w
          LEFT JOIN profiles p ON w.user_id = p.id
          WHERE w.status = 'ACTIVE'
        `;
        const wParams: unknown[] = [];
        if (filters?.wilaya && !isNaN(filters.wilaya)) {
          wSql += ` AND w.wilaya = $1`;
          wParams.push(filters.wilaya);
        }
        wSql += ` ORDER BY w.created_at DESC`;
        const wRows = await query(wSql, wParams);
        if (wRows && wRows.length > 0) {
          wasteItems = wRows.map((w) => ({
            id: w.id as string,
            user_id: w.user_id as string,
            category: 'WASTE' as const,
            sub_category: w.waste_type as string,
            title: `عرض نفايات: ${w.type || w.waste_type}`,
            description: `الكمية: ${w.quantity} ${w.unit} - ${w.pickup_available ? 'الرفع متاح' : 'التسليم من الموقع'}`,
            price: Number(w.asking_price) || 0,
            price_type: (w.unit === 'kg' ? 'kg' : w.unit === 'm3' ? 'm3' : 'fixed') as Listing['price_type'],
            condition: 'used' as const,
            wilaya: Number(w.wilaya),
            images: Array.isArray(w.images) && w.images.length > 0 ? (w.images as string[]) : ['/images/recycling.png'],
            is_available: true,
            views_count: 0,
            created_at: w.created_at ? new Date(w.created_at as string).toISOString() : new Date().toISOString(),
            profiles: {
              full_name: (w.full_name as string) || 'مستخدم غير معروف',
              avatar_url: w.avatar_url as string | undefined,
              rating_avg: w.rating_avg ? Number(w.rating_avg) : 5.0,
            },
          }));
        }
      } catch (e) {
        console.error('Error fetching waste listings in getListings:', e);
      }
    }

    const dbListings: Listing[] = (rows || []).map(r => ({
      id: r.id as string,
      user_id: r.user_id as string,
      category: r.category as Listing['category'],
      sub_category: r.sub_category as string,
      title: r.title as string,
      description: r.description as string,
      price: Number(r.price) || 0,
      price_type: r.price_type as Listing['price_type'],
      condition: r.condition as Listing['condition'],
      wilaya: Number(r.wilaya),
      images: (r.images as string[]) || [],
      is_available: Boolean(r.is_available),
      views_count: Number(r.views_count) || 0,
      created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
      profiles: {
        full_name: (r.full_name as string) || 'مستخدم غير معروف',
        avatar_url: r.avatar_url as string | undefined,
        rating_avg: r.rating_avg ? Number(r.rating_avg) : 5.0
      }
    }));

    const combined = isWasteCategory ? [...wasteItems, ...dbListings] : [...dbListings, ...wasteItems];

    if (combined.length === 0) {
      // Return filtered mock listings
      return MOCK_LISTINGS.filter(item => {
        if (filters?.category && filters.category !== 'all' && filters.category !== 'الكل') {
          if (item.category !== filters.category) return false;
        }
        if (filters?.wilaya && !isNaN(filters.wilaya)) {
          if (item.wilaya !== filters.wilaya) return false;
        }
        if (filters?.search) {
          if (!item.title.toLowerCase().includes(filters.search.toLowerCase()) && !item.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
        }
        return true;
      });
    }

    return combined;
  } catch (error) {
    console.error('Error fetching listings:', error);
    // Surface the failure as "no results" rather than fabricating listings.
    // Callers render an empty state, which is honest, instead of showing
    // invented providers with fake ratings and prices.
    return [];
  }
}

export async function getListingById(id: string) {
  try {
    if (id.startsWith('mock-')) {
      const found = MOCK_LISTINGS.find(m => m.id === id);
      if (found) {
        return {
          ...found,
          profiles: {
            id: found.user_id,
            role: "PROVIDER",
            full_name: found.profiles?.full_name || 'موزع معتمد',
            phone: "+213 555 12 34 56",
            wilaya: found.wilaya,
            avatar_url: found.profiles?.avatar_url,
            bio: "مورد وموزع معتمد لمواد وعقارات البناء والإنشاءات بالجزائر.",
            provider_type: "شركة",
            specialty: found.sub_category || "البناء والتجهيز",
            is_verified: true,
            rating_avg: found.profiles?.rating_avg || 4.9,
            completed_jobs: 142,
            created_at: new Date(Date.now() - 365 * 86400000).toISOString()
          }
        };
      }
    }

// Listing ids are UUIDs. Anything else (an unknown "mock-*" id, or a
    // hand-typed URL) can never match a row, and sending it to Postgres would
    // fail with 22P02 on every request.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return null;
    }

    const rows = await query(`
      SELECT l.*, p.role, p.full_name, p.phone, p.wilaya AS profile_wilaya, p.avatar_url, p.bio, p.provider_type, p.specialty, p.is_verified, p.rating_avg, p.completed_jobs, p.created_at AS profile_created_at
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.id
      WHERE l.id = $1
    `, [id]);

    if (rows.length === 0) {
      const found = MOCK_LISTINGS.find(m => m.id === id);
      if (found) return getListingById(found.id);
      return null;
    }
    const r = rows[0];

    // Increment views count asynchronously (fire and forget)
    query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]).catch(e => console.error('Error updating views_count:', e));

    return {
      id: r.id,
      user_id: r.user_id,
      category: r.category,
      sub_category: r.sub_category,
      title: r.title,
      description: r.description,
      price: Number(r.price) || 0,
      price_type: r.price_type,
      condition: r.condition,
      wilaya: r.wilaya,
      images: r.images || [],
      is_available: r.is_available,
      views_count: r.views_count,
      created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
      profiles: {
        id: r.user_id,
        role: r.role,
        full_name: r.full_name || 'مستخدم غير معروف',
        phone: r.phone,
        wilaya: r.profile_wilaya,
        avatar_url: r.avatar_url,
        bio: r.bio,
        provider_type: r.provider_type,
        specialty: r.specialty,
        is_verified: r.is_verified,
        rating_avg: r.rating_avg ? Number(r.rating_avg) : 5.0,
        completed_jobs: r.completed_jobs,
        created_at: r.profile_created_at ? new Date(r.profile_created_at as string).toISOString() : new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    return null;
  }
}

export async function createBooking(bookingData: {
  client_id?: string;
  provider_id: string;
  listing_id: string;
  total_price?: number;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // client_id is always the authenticated caller — never a caller-supplied value.
  const clientId = user.id;

  // Price is derived from the listing so it cannot be forged by the caller.
  const listings = await query(
    'SELECT price, user_id FROM listings WHERE id = $1',
    [bookingData.listing_id]
  );
  if (listings.length === 0) {
    throw new Error('Listing not found');
  }
  if (String(listings[0].user_id) !== String(bookingData.provider_id)) {
    throw new Error('Listing does not belong to this provider');
  }
  const price = Number(listings[0].price);

  try {
    const rows = await query(`
      INSERT INTO bookings (client_id, provider_id, listing_id, status, total_price, notes, created_at)
      VALUES ($1, $2, $3, 'PENDING', $4, $5, NOW())
      RETURNING *
    `, [
      clientId,
      bookingData.provider_id,
      bookingData.listing_id,
      price,
      bookingData.notes || null
    ]);
    return rows[0];
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// ── Admin Dispatch Functions ───────────────────────────────────────────────────

export async function createDispatchBooking(data: {
  provider_id: string | null;
  service_type: string;
  urgency: string;
  wilaya: number;
  notes?: string;
  request_id?: string;   // dispatching an existing client request
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  if (!data.provider_id) throw new Error('اختر مزوّداً أولاً');
  try {
    // When dispatching an existing customer request, update that row so the
    // original PENDING request does not linger and get dispatched twice.
    if (data.request_id) {
      const updated = await query(`
        UPDATE bookings
        SET provider_id = $1,
            status = 'DISPATCHED',
            provider_response = 'PENDING',
            provider_response_deadline = NOW() + INTERVAL '2 hours',
            provider_responded_at = NULL,
            total_price = COALESCE(quoted_price, total_price),
            notes = COALESCE(NULLIF($3, ''), notes),
            updated_at = NOW()
        WHERE id = $2 AND status = 'PENDING'
        RETURNING *
      `, [data.provider_id, data.request_id, data.notes ?? '']);
      if (updated.length === 0) {
        throw new Error('Request is no longer pending');
      }
      const assigned = updated[0];
      await insertNotification({
        user_id: data.provider_id,
        type: 'dispatch',
        message: 'تم إسناد مهمة جديدة إليك. لديك ساعتان للقبول أو الاعتذار.',
        link: '/dashboard/provider',
      });
      if (assigned.client_id && String(assigned.client_id) !== String(data.provider_id)) {
        await insertNotification({
          user_id: String(assigned.client_id),
          type: 'status_update',
          message: 'تم تعيين مزوّد لطلبك، بانتظار تأكيده.',
          link: '/dashboard/client',
        });
      }
      await insertBookingEvent(
        String(assigned.id),
        admin.id,
        'ADMIN',
        'assigned',
        'تم تعيين مزوّد للطلب'
      );
      return assigned;
    }

    const rows = await query(`
      INSERT INTO bookings
        (client_id, provider_id, status, service_type, urgency, wilaya, notes,
         provider_response, provider_response_deadline, created_at, updated_at)
      VALUES
        (COALESCE($1, (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)),
         $1, 'DISPATCHED', $2, $3, $4, $5, 'PENDING', NOW() + INTERVAL '2 hours', NOW(), NOW())
      RETURNING *
    `, [
      data.provider_id,
      data.service_type,
      data.urgency,
      data.wilaya,
      data.notes ?? null,
    ]);
    if (rows[0]) {
      await insertNotification({
        user_id: data.provider_id,
        type: 'dispatch',
        message: 'تم إرسال أمر عمل جديد إليك. لديك ساعتان للقبول أو الاعتذار.',
        link: '/dashboard/provider',
      });
      await insertBookingEvent(
        String(rows[0].id),
        admin.id,
        'ADMIN',
        'created',
        'أنشأت الإدارة أمر عمل مباشر'
      );
    }
    return rows[0];
  } catch (error) {
    console.error('Error creating dispatch booking:', error);
    throw error;
  }
}

export async function getDispatchHistory(limit = 30) {
  const admin = await requireAdmin();
  if (!admin) return [];
  await releaseExpiredAssignments();
  try {
    const rows = await query(`
      SELECT
        b.id, b.service_type, b.urgency, b.wilaya, b.status, b.notes, b.task,
        b.commune, b.budget_min, b.budget_max, b.preferred_date, b.attachments,
        b.offer_status, b.quoted_price, b.offer_message, b.payment_status,
        b.cancellation_reason, b.cancelled_by, b.provider_response,
        b.provider_response_deadline, b.created_at,
        p.full_name    AS provider_name,
        p.avatar_url   AS provider_avatar,
        p.is_verified  AS provider_verified
      FROM bookings b
      LEFT JOIN profiles p ON b.provider_id = p.id
      WHERE b.status IN ('DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
        AND b.service_type IS NOT NULL
      ORDER BY b.created_at DESC
      LIMIT $1
    `, [limit]);

    return rows.map(r => ({
      id:            r.id as string,
      service_type:  r.service_type as string,
      urgency:       r.urgency as string,
      wilaya:        Number(r.wilaya),
      status:        r.status as string,
      notes:         r.notes as string | null,
      task:          (r.task as string | null) ?? null,
      commune:       (r.commune as string | null) ?? null,
      budget_min:    r.budget_min !== null && r.budget_min !== undefined ? Number(r.budget_min) : null,
      budget_max:    r.budget_max !== null && r.budget_max !== undefined ? Number(r.budget_max) : null,
      preferred_date: r.preferred_date ? new Date(r.preferred_date as string).toISOString().slice(0, 10) : null,
      attachments:   (r.attachments as string[] | null) ?? [],
      offer_status:  (r.offer_status as string | null) ?? 'NONE',
      quoted_price:  r.quoted_price !== null && r.quoted_price !== undefined ? Number(r.quoted_price) : null,
      offer_message: (r.offer_message as string | null) ?? null,
      payment_status: (r.payment_status as string | null) ?? 'UNPAID',
      cancellation_reason: (r.cancellation_reason as string | null) ?? null,
      cancelled_by:  (r.cancelled_by as string | null) ?? null,
      provider_response: (r.provider_response as string | null) ?? 'NONE',
      provider_response_deadline: r.provider_response_deadline
        ? new Date(r.provider_response_deadline as string).toISOString()
        : null,
      created_at:    r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
      provider: r.provider_name
        ? {
            name:      r.provider_name as string,
            avatar:    r.provider_avatar as string | null,
            verified:  Boolean(r.provider_verified),
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching dispatch history:', error);
    return [];
  }
}

export async function getAvailableProviders(serviceType?: string, wilayaId?: number) {
  const admin = await requireAdmin();
  if (!admin) return [];
  try {
    const params: unknown[] = [];
    let whereClause = `WHERE p.role = 'PROVIDER'`;

    if (serviceType) {
      params.push(serviceType);
      whereClause += ` AND (p.specialty = $${params.length} OR p.specialty IS NULL)`;
    }
    if (wilayaId) {
      params.push(wilayaId);
      whereClause += ` AND (p.wilaya = $${params.length} OR p.wilaya IS NULL)`;
    }

    const rows = await query(`
      SELECT
        p.id, p.full_name, p.specialty, p.wilaya,
        p.rating_avg, p.is_verified, p.completed_jobs, p.avatar_url,
        -- count active bookings to gauge availability
        COUNT(b.id) FILTER (WHERE b.status IN ('DISPATCHED','IN_PROGRESS')) AS active_jobs
      FROM profiles p
      LEFT JOIN bookings b ON b.provider_id = p.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.rating_avg DESC NULLS LAST, p.completed_jobs DESC
    `, params);

    return rows.map(r => ({
      id:            r.id as string,
      name:          (r.full_name as string) || 'مزود خدمة',
      specialty:     r.specialty as string | null,
      wilaya:        r.wilaya ? Number(r.wilaya) : null,
      rating:        r.rating_avg ? Number(r.rating_avg) : 0,
      verified:      Boolean(r.is_verified),
      completedJobs: Number(r.completed_jobs) || 0,
      avatar:        r.avatar_url as string | null,
      activeJobs:    Number(r.active_jobs) || 0,
      available:     (Number(r.active_jobs) || 0) < 3, // available if <3 active jobs
    }));
  } catch (error) {
    console.error('Error fetching available providers:', error);
    return [];
  }
}

export async function getExistingBooking(clientId: string, providerId: string, listingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  // Callers may only look up their own bookings, never someone else's.
  if (String(user.id) !== String(clientId)) throw new Error('Forbidden');
  try {
    const rows = await query(`
      SELECT id FROM bookings 
      WHERE client_id = $1 AND provider_id = $2 AND listing_id = $3
      LIMIT 1
    `, [clientId, providerId, listingId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error checking existing booking:', error);
    return null;
  }
}

export async function getProfile(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  // Self-service reads are fine; anyone else requires admin.
  if (String(user.id) !== String(id) && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  try {
    const rows = await query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function getProviderStats(providerId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  // Revenue figures are private to the provider (and admins).
  if (String(user.id) !== String(providerId) && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  try {
    const listings = await query('SELECT id FROM listings WHERE user_id = $1', [providerId]);
    const bookings = await query('SELECT total_price, status FROM bookings WHERE provider_id = $1', [providerId]);
    const totalRevenue = (bookings as Array<Record<string, unknown>>).reduce((acc: number, b) => acc + (b['status'] === 'COMPLETED' ? Number(b['total_price']) || 0 : 0), 0) || 0;
    
    return {
      listingsCount: listings.length,
      bookingsCount: bookings.length,
      totalRevenue
    };
  } catch (error) {
    console.error('Error getting provider stats:', error);
    return { listingsCount: 0, bookingsCount: 0, totalRevenue: 0 };
  }
}

// Additional customized server actions for option B:

export async function getProviderListings() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query('SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
  return rows.map(r => ({
    ...r,
    price: Number(r.price) || 0,
    created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString()
  }));
}

export async function createListing(listingData: {
  category: string;
  sub_category?: string;
  title: string;
  description: string;
  price: number;
  price_type?: string;
  condition?: string;
  wilaya: number;
  images: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    INSERT INTO listings (user_id, category, sub_category, title, description, price, price_type, condition, wilaya, images, is_available, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, NOW())
    RETURNING *
  `, [
    user.id,
    listingData.category,
    listingData.sub_category || null,
    listingData.title,
    listingData.description,
    listingData.price,
    listingData.price_type || null,
    listingData.condition || null,
    listingData.wilaya,
    listingData.images
  ]);
  return rows[0];
}

export async function deleteListing(listingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    DELETE FROM listings 
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `, [listingId, user.id]);
  return rows.length > 0;
}

export async function updateListingAvailability(listingId: string, isAvailable: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    UPDATE listings 
    SET is_available = $1 
    WHERE id = $2 AND user_id = $3
    RETURNING *
  `, [isAvailable, listingId, user.id]);
  return rows.length > 0;
}

const MOCK_WASTE = [
  {
    id: "w-1",
    user_id: "usr-7",
    type: "ردم خرسانة وحجارة هدم",
    waste_type: "concrete",
    quantity: 15,
    unit: "شاحنة (م³)",
    asking_price: 0,
    pickup_available: true,
    wilaya: 16,
    images: ["/images/recycling.png"],
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    profiles: {
      full_name: "مؤسسة الورشة النظيفة",
      avatar_url: undefined,
      rating_avg: 4.8,
      is_verified: true
    }
  },
  {
    id: "w-2",
    user_id: "usr-9",
    type: "بقايا حديد وقضبان بناء خردة",
    waste_type: "iron",
    quantity: 2500,
    unit: "كغ",
    asking_price: 18000,
    pickup_available: false,
    wilaya: 31,
    images: ["/images/recycling.png"],
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    profiles: {
      full_name: "مركز تدوير المعادن وهران",
      avatar_url: undefined,
      rating_avg: 4.9,
      is_verified: true
    }
  },
  {
    id: "w-3",
    user_id: "usr-10",
    type: "خشب قوالب بناء مستعمل وطبالي",
    waste_type: "wood",
    quantity: 80,
    unit: "قطعة",
    asking_price: 5000,
    pickup_available: true,
    wilaya: 25,
    images: ["/images/recycling.png"],
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    profiles: {
      full_name: "جمعية تدوير الخشب والبلاستيك",
      avatar_url: undefined,
      rating_avg: 4.7,
      is_verified: false
    }
  },
  {
    id: "w-4",
    user_id: "usr-11",
    type: "أتربة حفر صالحة للردم والتهيئة",
    waste_type: "soil",
    quantity: 40,
    unit: "م³",
    asking_price: 0,
    pickup_available: true,
    wilaya: 19,
    images: ["/images/recycling.png"],
    status: "ACTIVE",
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    profiles: {
      full_name: "رشيد للخدمات العامة",
      avatar_url: undefined,
      rating_avg: 5.0,
      is_verified: true
    }
  }
];

export async function getWasteListings(wasteType?: string) {
  try {
    let sql = `
      SELECT w.*, p.full_name, p.avatar_url, p.rating_avg, p.is_verified
      FROM waste_listings w
      LEFT JOIN profiles p ON w.user_id = p.id
      WHERE w.status = 'ACTIVE'
    `;
    const params: unknown[] = [];
    if (wasteType && wasteType !== 'all') {
      sql += ` AND w.waste_type = $1`;
      params.push(wasteType);
    }
    sql += ` ORDER BY w.created_at DESC`;

    const rows = await query(sql, params);
    if (!rows || rows.length === 0) {
      return MOCK_WASTE.filter(w => !wasteType || wasteType === 'all' || w.waste_type === wasteType);
    }

    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      waste_type: r.waste_type,
      quantity: Number(r.quantity) || 0,
      unit: r.unit,
      asking_price: Number(r.asking_price) || 0,
      pickup_available: r.pickup_available,
      wilaya: r.wilaya,
      images: r.images || [],
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
      profiles: {
        full_name: r.full_name || 'مستخدم غير معروف',
        avatar_url: r.avatar_url,
        rating_avg: r.rating_avg ? Number(r.rating_avg) : 5.0,
        is_verified: !!r.is_verified
      }
    }));
  } catch (error) {
    console.error('Error fetching waste listings:', error);
    return MOCK_WASTE.filter(w => !wasteType || wasteType === 'all' || w.waste_type === wasteType);
  }
}

export async function createWasteListing(wasteData: {
  type: string;
  waste_type: string;
  quantity: number;
  unit: string;
  asking_price: number;
  pickup_available: boolean;
  wilaya: number;
  images: string[];
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    INSERT INTO waste_listings (user_id, type, waste_type, quantity, unit, asking_price, pickup_available, wilaya, images, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', NOW())
    RETURNING *
  `, [
    user.id,
    wasteData.type,
    wasteData.waste_type,
    wasteData.quantity,
    wasteData.unit,
    wasteData.asking_price,
    wasteData.pickup_available,
    wasteData.wilaya,
    wasteData.images
  ]);
  return rows[0];
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await query('SELECT * FROM profiles WHERE id = $1', [user.id]);
  if (rows.length === 0) return null;
  return rows[0];
}

export async function getClientBookings() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  await releaseExpiredAssignments();
  const rows = await query(`
    SELECT b.*, p.full_name AS provider_name, p.avatar_url AS provider_avatar, l.title AS listing_title, l.images AS listing_images
    FROM bookings b
    LEFT JOIN profiles p ON b.provider_id = p.id
    LEFT JOIN listings l ON b.listing_id = l.id
    WHERE b.client_id = $1
    ORDER BY b.created_at DESC
  `, [user.id]);
  return rows.map(r => ({
    id: r.id as string,
    client_id: r.client_id as string | null,
    provider_id: r.provider_id as string | null,
    listing_id: r.listing_id as string | null,
    status: r.status as string,
    start_date: r.start_date as string | null,
    end_date: r.end_date as string | null,
    total_price: Number(r.total_price) || 0,
    notes: r.notes as string | null,
    task: (r.task as string | null) ?? null,
    service_type: r.service_type as string | null,
    urgency: r.urgency as string | null,
    wilaya: r.wilaya ? Number(r.wilaya) : null,
    commune: (r.commune as string | null) ?? null,
    budget_min: r.budget_min !== null && r.budget_min !== undefined ? Number(r.budget_min) : null,
    budget_max: r.budget_max !== null && r.budget_max !== undefined ? Number(r.budget_max) : null,
    preferred_date: r.preferred_date ? new Date(r.preferred_date as string).toISOString().slice(0, 10) : null,
    attachments: (r.attachments as string[] | null) ?? [],
    offer_status: (r.offer_status as string | null) ?? 'NONE',
    quoted_price: r.quoted_price !== null && r.quoted_price !== undefined ? Number(r.quoted_price) : null,
    offer_message: (r.offer_message as string | null) ?? null,
    offer_sent_at: r.offer_sent_at ? new Date(r.offer_sent_at as string).toISOString() : null,
    offer_responded_at: r.offer_responded_at
      ? new Date(r.offer_responded_at as string).toISOString()
      : null,
    payment_status: (r.payment_status as string | null) ?? 'UNPAID',
    payment_method: (r.payment_method as string | null) ?? null,
    paid_at: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
    cancellation_reason: (r.cancellation_reason as string | null) ?? null,
    cancelled_by: (r.cancelled_by as string | null) ?? null,
    provider_response: (r.provider_response as string | null) ?? 'NONE',
    provider_response_deadline: r.provider_response_deadline
      ? new Date(r.provider_response_deadline as string).toISOString()
      : null,
    created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
    profiles: {
      full_name: (r.provider_name as string) || 'مستخدم غير معروف',
      avatar_url: r.provider_avatar as string | null,
    },
    listings: {
      title: (r.listing_title as string) || 'إعلان محذوف',
      images: (r.listing_images as string[]) || [],
    },
  }));
}

export async function getProviderBookings() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  await releaseExpiredAssignments();
  const rows = await query(`
    SELECT b.*, p.full_name AS client_name, p.avatar_url AS client_avatar, l.title AS listing_title, l.images AS listing_images
    FROM bookings b
    LEFT JOIN profiles p ON b.client_id = p.id
    LEFT JOIN listings l ON b.listing_id = l.id
    WHERE b.provider_id = $1
    ORDER BY b.created_at DESC
  `, [user.id]);
  return rows.map(r => ({
    id: r.id as string,
    client_id: r.client_id as string | null,
    provider_id: r.provider_id as string | null,
    listing_id: r.listing_id as string | null,
    status: r.status as string,
    start_date: r.start_date as string | null,
    end_date: r.end_date as string | null,
    total_price: Number(r.total_price) || 0,
    notes: r.notes as string | null,
    task: (r.task as string | null) ?? null,
    service_type: r.service_type as string | null,
    urgency: r.urgency as string | null,
    wilaya: r.wilaya ? Number(r.wilaya) : null,
    commune: (r.commune as string | null) ?? null,
    budget_min: r.budget_min !== null && r.budget_min !== undefined ? Number(r.budget_min) : null,
    budget_max: r.budget_max !== null && r.budget_max !== undefined ? Number(r.budget_max) : null,
    preferred_date: r.preferred_date ? new Date(r.preferred_date as string).toISOString().slice(0, 10) : null,
    attachments: (r.attachments as string[] | null) ?? [],
    offer_status: (r.offer_status as string | null) ?? 'NONE',
    quoted_price: r.quoted_price !== null && r.quoted_price !== undefined ? Number(r.quoted_price) : null,
    offer_message: (r.offer_message as string | null) ?? null,
    offer_sent_at: r.offer_sent_at ? new Date(r.offer_sent_at as string).toISOString() : null,
    offer_responded_at: r.offer_responded_at
      ? new Date(r.offer_responded_at as string).toISOString()
      : null,
    payment_status: (r.payment_status as string | null) ?? 'UNPAID',
    payment_method: (r.payment_method as string | null) ?? null,
    paid_at: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
    cancellation_reason: (r.cancellation_reason as string | null) ?? null,
    cancelled_by: (r.cancelled_by as string | null) ?? null,
    provider_response: (r.provider_response as string | null) ?? 'NONE',
    provider_response_deadline: r.provider_response_deadline
      ? new Date(r.provider_response_deadline as string).toISOString()
      : null,
    created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
    profiles: {
      full_name: (r.client_name as string) || 'زبون غير معروف',
      avatar_url: r.client_avatar as string | null,
    },
    listings: {
      title: (r.listing_title as string) || 'إعلان محذوف',
      images: (r.listing_images as string[]) || [],
    },
  }));
}

const BOOKING_STATUSES = ['PENDING', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
type BookingStatus = (typeof BOOKING_STATUSES)[number];

export async function updateBookingStatus(bookingId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  if (!BOOKING_STATUSES.includes(status as BookingStatus)) {
    throw new Error(`Invalid booking status: ${status}`);
  }

  // Fetch current state to enforce role-based transitions
  const current = await query(
    'SELECT id, client_id, provider_id, status, provider_response FROM bookings WHERE id = $1',
    [bookingId]
  );
  if (current.length === 0) return false;

  const booking = current[0];
  const isProvider = !!booking.provider_id && String(booking.provider_id) === user.id;
  const isClient = !!booking.client_id && String(booking.client_id) === user.id;
  const isAdmin = user.role === 'ADMIN';

  if (!isProvider && !isClient && !isAdmin) return false;

  // Only the assigned provider (or an admin) may advance work progress.
  // A client may only cancel, never self-mark their own work COMPLETED.
  const providerOnly: BookingStatus[] = ['DISPATCHED', 'IN_PROGRESS', 'COMPLETED'];
  if (providerOnly.includes(status as BookingStatus) && !isProvider && !isAdmin) {
    throw new Error('Only the assigned provider can update this status');
  }

  // A provider must accept the assignment before starting work, otherwise a
  // dispatcher could think the job is underway while the provider never saw it.
  if (
    isProvider &&
    !isAdmin &&
    status === 'IN_PROGRESS' &&
    String(booking.provider_response) !== 'ACCEPTED'
  ) {
    throw new Error('يجب قبول المهمة قبل بدء العمل');
  }

  // Clients may only withdraw a request that has not started yet. Once a
  // provider is working, cancelling silently would strand them.
  const currentStatus = String(booking.status) as BookingStatus;
  if (isClient && !isAdmin) {
    if (status !== 'CANCELLED') {
      throw new Error('Customers can only cancel a request');
    }
    if (currentStatus !== 'PENDING' && currentStatus !== 'DISPATCHED') {
      throw new Error('This request can no longer be cancelled');
    }
  }

  // A provider must never move work backwards — that would let a finished job
  // be reopened and the customer notified of a false regression.
  if (isProvider && !isAdmin) {
    const forward: Record<BookingStatus, BookingStatus[]> = {
      PENDING: ['DISPATCHED'],
      DISPATCHED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!forward[currentStatus]?.includes(status as BookingStatus)) {
      throw new Error(`Invalid status change: ${currentStatus} → ${status}`);
    }
  }

  const actorRole = isAdmin ? 'ADMIN' : isProvider ? 'PROVIDER' : 'CLIENT';
  const cancelReason =
    status === 'CANCELLED'
      ? isClient
        ? 'ألغى العميل الطلب'
        : isProvider
        ? 'ألغى المزوّد المهمة'
        : 'ألغت الإدارة الطلب'
      : null;

  const rows = await query(`
    UPDATE bookings 
    SET status = $1,
        updated_at = NOW(),
        cancellation_reason = CASE WHEN $1 = 'CANCELLED' THEN COALESCE(cancellation_reason, $5) ELSE cancellation_reason END,
        cancelled_by = CASE WHEN $1 = 'CANCELLED' THEN COALESCE(cancelled_by, $6) ELSE cancelled_by END
    WHERE id = $2 AND ($3::boolean OR provider_id = $4 OR client_id = $4)
    RETURNING *
  `, [status, bookingId, isAdmin, user.id, cancelReason, actorRole]);

  if (rows.length > 0) {
    const updated = rows[0];
    const hasClient = updated.client_id && String(updated.client_id) !== user.id;
    if ((isProvider || isAdmin) && hasClient) {
      const message =
        status === 'IN_PROGRESS'
          ? 'بدأ المزود العمل على طلبك'
          : status === 'COMPLETED'
          ? 'تم إكمال طلبك بنجاح'
          : status === 'CANCELLED'
          ? 'تم إلغاء الطلب من طرف المزود'
          : `تحديث حالة الطلب: ${status}`;
      await insertNotification({
        user_id: String(updated.client_id),
        type: 'status_update',
        message,
        link: '/dashboard/client',
      });
    }

    if (status === 'CANCELLED' && (isProvider || isClient)) {
      await notifyAdmins(
        isProvider ? 'ألغى المزوّد مهمة قيد التنفيذ.' : 'ألغى العميل طلبه.',
        '/admin/dispatch'
      );
    }

    if (status === 'CANCELLED' && isClient && updated.provider_id) {
      await insertNotification({
        user_id: String(updated.provider_id),
        type: 'status_update',
        message: 'ألغى العميل المهمة التي أُسندت إليك.',
        link: '/dashboard/provider',
      });
    }

    await insertBookingEvent(
      bookingId,
      user.id,
      actorRole,
      `status_${status.toLowerCase()}`,
      cancelReason || `تحديث الحالة إلى ${status}`
    );
  }
  return rows.length > 0;
}

export async function getUserChats() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    SELECT b.*, 
           p_client.full_name AS client_name,
           p_provider.full_name AS provider_name,
           l.title AS listing_title
    FROM bookings b
    LEFT JOIN profiles p_client ON b.client_id = p_client.id
    LEFT JOIN profiles p_provider ON b.provider_id = p_provider.id
    LEFT JOIN listings l ON b.listing_id = l.id
    WHERE b.provider_id = $1 OR b.client_id = $1
    ORDER BY b.created_at DESC
  `, [user.id]);
  
  return rows.map(r => {
    const otherName = user.id === r.client_id ? r.provider_name : r.client_name;
    return {
      id: r.id,
      client_id: r.client_id,
      provider_id: r.provider_id,
      listing_id: r.listing_id,
      status: r.status,
      profiles: {
        full_name: otherName || 'مستخدم غير معروف'
      },
      listings: {
        title: r.listing_title || 'إعلان غير معروف'
      }
    };
  });
}

export async function getMessagesByBookingId(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const check = await query('SELECT id FROM bookings WHERE id = $1 AND (client_id = $2 OR provider_id = $2)', [bookingId, user.id]);
  if (check.length === 0) throw new Error('Unauthorized');
  
  const rows = await query(`
    SELECT * FROM messages 
    WHERE booking_id = $1 
    ORDER BY created_at ASC
  `, [bookingId]);
  
  return rows.map(r => ({
    id: r.id,
    booking_id: r.booking_id,
    sender_id: r.sender_id,
    content: r.content,
    created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
    read_at: r.read_at ? new Date(r.read_at as string).toISOString() : null
  }));
}

export async function sendChatMessage(bookingId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
  const check = await query('SELECT id FROM bookings WHERE id = $1 AND (client_id = $2 OR provider_id = $2)', [bookingId, user.id]);
  if (check.length === 0) throw new Error('Unauthorized');

  const rows = await query(`
    INSERT INTO messages (booking_id, sender_id, content, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `, [bookingId, user.id, content]);
  return rows[0];
}

export async function getProviderDashboardData() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Full name
  const profiles = await query('SELECT full_name FROM profiles WHERE id = $1', [user.id]);
  const userName = profiles.length > 0 ? String(profiles[0].full_name || '').split(' ')[0] : '';

  // 2. Listings count
  const listingsCountResult = await query('SELECT COUNT(*)::int AS count FROM listings WHERE user_id = $1', [user.id]);
  const listingsCount = listingsCountResult[0]?.count || 0;

  // 3. Pending Bookings Count
  const bookingsCountResult = await query('SELECT COUNT(*)::int AS count FROM bookings WHERE provider_id = $1 AND status = \'PENDING\'', [user.id]);
  const bookingsCount = bookingsCountResult[0]?.count || 0;

  // 4. Unread Messages Count
  const userBookings = await query('SELECT id FROM bookings WHERE provider_id = $1', [user.id]);
  const bookingIds = userBookings.map(b => b.id);
  let messagesCount = 0;
  if (bookingIds.length > 0) {
    const unreadMessagesResult = await query(`
      SELECT COUNT(*)::int AS count 
      FROM messages 
      WHERE booking_id = ANY($1) AND sender_id != $2 AND read_at IS NULL
    `, [bookingIds, user.id]);
    messagesCount = Number(unreadMessagesResult[0]?.count) || 0;
  }

  // 5. Revenue
  const completedBookingsResult = await query('SELECT SUM(total_price)::numeric AS revenue FROM bookings WHERE provider_id = $1 AND status = \'COMPLETED\'', [user.id]);
  const revenue = Number(completedBookingsResult[0]?.revenue) || 0;

  // 6. Recent bookings (limit 5)
  const recent = await query(`
    SELECT b.*, p.full_name AS client_name, l.title AS listing_title
    FROM bookings b
    LEFT JOIN profiles p ON b.client_id = p.id
    LEFT JOIN listings l ON b.listing_id = l.id
    WHERE b.provider_id = $1
    ORDER BY b.created_at DESC
    LIMIT 5
  `, [user.id]);

  const recentBookings = recent.map(r => ({
    id: r.id,
    client_id: r.client_id,
    provider_id: r.provider_id,
    listing_id: r.listing_id,
    status: r.status,
    total_price: Number(r.total_price) || 0,
    created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
    profiles: {
      full_name: r.client_name || 'زبون غير معروف'
    },
    listings: {
      title: r.listing_title || 'إعلان غير معروف'
    }
  }));

  return {
    userName,
    stats: {
      listingsCount,
      bookingsCount,
      messagesCount,
      revenue
    },
    recentBookings
  };
}

export async function updateUserProfile(data: {
  full_name?: string;
  phone?: string;
  wilaya?: number | null;
  baladia?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  provider_type?: string | null;
  specialty?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (data.full_name !== undefined) {
    fields.push(`full_name = $${index++}`);
    values.push(data.full_name);
  }
  if (data.phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(data.phone);
  }
  if (data.wilaya !== undefined) {
    fields.push(`wilaya = $${index++}`);
    values.push(data.wilaya);
  }
  if (data.baladia !== undefined) {
    fields.push(`baladia = $${index++}`);
    values.push(data.baladia);
  }
  if (data.avatar_url !== undefined) {
    fields.push(`avatar_url = $${index++}`);
    values.push(data.avatar_url);
  }
  if (data.bio !== undefined) {
    fields.push(`bio = $${index++}`);
    values.push(data.bio);
  }
  if (data.provider_type !== undefined) {
    fields.push(`provider_type = $${index++}`);
    values.push(data.provider_type);
  }
  if (data.specialty !== undefined) {
    fields.push(`specialty = $${index++}`);
    values.push(data.specialty);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(user.id);
  const queryStr = `
    UPDATE profiles
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;

  const rows = await query(queryStr, values);
  return rows[0];
}

// ── Client Service Requests (from public craftsmen page) ───────────────────────

const REQUEST_URGENCIES = ['normal', 'urgent', 'asap'];
const MAX_REQUESTS_PER_DAY = 8;
const DUPLICATE_WINDOW_MINUTES = 10;
const MAX_ATTACHMENTS = 3;

export type CreateClientRequestResult =
  | { ok: true; request: { id: string; status: string; created_at: string } }
  | { ok: false; error: string };

export async function createClientRequest(data: {
  service_type: string;
  urgency: string;
  wilaya: number;
  notes?: string;
  task?: string;
  commune?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_date?: string | null;
  attachments?: string[];
}): Promise<CreateClientRequestResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'يجب تسجيل الدخول أولاً' };

  const serviceType = String(data.service_type || '').trim();
  if (!serviceType || serviceType.length > 40) {
    return { ok: false, error: 'نوع الخدمة غير صالح' };
  }
  if (!REQUEST_URGENCIES.includes(data.urgency)) {
    return { ok: false, error: 'درجة الاستعجال غير صالحة' };
  }
  const wilaya = Number(data.wilaya);
  if (!Number.isInteger(wilaya) || wilaya < 1 || wilaya > 58) {
    return { ok: false, error: 'اختر ولاية صحيحة' };
  }

  const notes = data.notes?.trim() || null;
  if (notes && notes.length > 2000) {
    return { ok: false, error: 'تفاصيل الطلب طويلة جداً (الحد 2000 حرف)' };
  }
  if (serviceType === 'custom' && !notes) {
    return { ok: false, error: 'اكتب تفاصيل طلبك' };
  }

  const commune = data.commune?.trim() || null;
  if (commune && commune.length > 100) {
    return { ok: false, error: 'اسم البلدية طويل جداً' };
  }

  const parseBudget = (value: number | null | undefined) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? n : NaN;
  };
  const budgetMin = parseBudget(data.budget_min);
  const budgetMax = parseBudget(data.budget_max);
  if (Number.isNaN(budgetMin) || Number.isNaN(budgetMax)) {
    return { ok: false, error: 'الميزانية غير صالحة' };
  }
  if (budgetMin !== null && budgetMax !== null && budgetMax < budgetMin) {
    return { ok: false, error: 'الحد الأعلى للميزانية يجب أن يكون أكبر من الحد الأدنى' };
  }

  let preferredDate: string | null = null;
  if (data.preferred_date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.preferred_date) || Number.isNaN(Date.parse(data.preferred_date))) {
      return { ok: false, error: 'التاريخ المفضل غير صالح' };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (data.preferred_date < today) {
      return { ok: false, error: 'لا يمكن اختيار تاريخ في الماضي' };
    }
    preferredDate = data.preferred_date;
  }

  const attachments = Array.isArray(data.attachments)
    ? data.attachments
        .map((url) => String(url || '').trim())
        .filter(Boolean)
        .slice(0, MAX_ATTACHMENTS)
    : [];
  if (attachments.some((url) => url.length > 500 || !url.startsWith('/api/images/'))) {
    return { ok: false, error: 'مرفق غير صالح' };
  }

  try {
    // Abuse guard: one client cannot flood the admin queue.
    const recent = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM bookings
       WHERE client_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [user.id]
    );
    if (Number(recent[0]?.count ?? 0) >= MAX_REQUESTS_PER_DAY) {
      return { ok: false, error: 'وصلت إلى الحد الأقصى من الطلبات اليومية. حاول غداً.' };
    }

    // Deduplicate accidental double-submits of the exact same request.
    const duplicate = await query<{ id: string }>(
      `SELECT id FROM bookings
       WHERE client_id = $1
         AND status <> 'CANCELLED'
         AND created_at > NOW() - ($2::int * INTERVAL '1 minute')
         AND COALESCE(service_type, '') = $3
         AND COALESCE(wilaya, 0) = $4
         AND COALESCE(notes, '') = $5
       LIMIT 1`,
      [user.id, DUPLICATE_WINDOW_MINUTES, serviceType, wilaya, notes ?? '']
    );
    if (duplicate.length > 0) {
      return {
        ok: false,
        error: 'يبدو أنك أرسلت هذا الطلب قبل قليل. انتظر رد الإدارة قبل إرساله مجدداً.',
      };
    }

    const rows = await query(`
      INSERT INTO bookings
        (client_id, provider_id, status, service_type, urgency, wilaya, notes, task,
         commune, budget_min, budget_max, preferred_date, attachments, created_at, updated_at)
      VALUES
        ($1, NULL, 'PENDING', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING id, status, created_at
    `, [
      user.id,
      serviceType,
      data.urgency,
      wilaya,
      notes,
      data.task?.trim() || null,
      commune,
      budgetMin,
      budgetMax,
      preferredDate,
      attachments,
    ]);

    const request = rows[0];
    const requestId = String(request.id);
    await insertBookingEvent(
      requestId,
      user.id,
      user.role ?? 'CLIENT',
      'created',
      'تم إنشاء الطلب'
    );
    await notifyAdmins(
      `طلب جديد من عميل${notes ? `: ${notes.slice(0, 90)}` : ''}`,
      '/admin/dispatch'
    );

    return {
      ok: true,
      request: {
        id: requestId,
        status: String(request.status),
        created_at: request.created_at
          ? new Date(request.created_at as string).toISOString()
          : new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error creating client request:', error);
    return { ok: false, error: 'تعذّر إرسال الطلب. حاول مرة أخرى.' };
  }
}

export async function getPendingRequests() {
  const admin = await requireAdmin();
  if (!admin) return [];
  await releaseExpiredAssignments();
  try {
    const rows = await query(`
      SELECT
        b.id, b.service_type, b.urgency, b.wilaya, b.notes, b.task,
        b.commune, b.budget_min, b.budget_max, b.preferred_date, b.attachments,
        b.offer_status, b.quoted_price, b.offer_message, b.offer_sent_at,
        b.offer_responded_at, b.payment_status, b.total_price,
        b.cancellation_reason, b.cancelled_by, b.created_at,
        p.full_name AS client_name,
        p.phone AS client_phone
      FROM bookings b
      LEFT JOIN profiles p ON b.client_id = p.id
      WHERE b.status = 'PENDING'
        AND b.provider_id IS NULL
        AND b.service_type IS NOT NULL
      ORDER BY
        (b.offer_status = 'ACCEPTED') DESC,
        CASE b.urgency WHEN 'asap' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
        b.created_at ASC
    `);
    return rows.map(r => {
      const createdAt = r.created_at
        ? new Date(r.created_at as string).toISOString()
        : new Date().toISOString();
      return {
        id: r.id as string,
        service_type: r.service_type as string,
        urgency: r.urgency as string,
        wilaya: Number(r.wilaya),
        notes: r.notes as string | null,
        task: (r.task as string | null) ?? null,
        commune: (r.commune as string | null) ?? null,
        budget_min: r.budget_min !== null && r.budget_min !== undefined ? Number(r.budget_min) : null,
        budget_max: r.budget_max !== null && r.budget_max !== undefined ? Number(r.budget_max) : null,
        preferred_date: r.preferred_date ? String(r.preferred_date).slice(0, 10) : null,
        attachments: (r.attachments as string[] | null) ?? [],
        offer_status: (r.offer_status as string | null) ?? 'NONE',
        quoted_price: r.quoted_price !== null && r.quoted_price !== undefined ? Number(r.quoted_price) : null,
        offer_message: (r.offer_message as string | null) ?? null,
        offer_sent_at: r.offer_sent_at ? new Date(r.offer_sent_at as string).toISOString() : null,
        offer_responded_at: r.offer_responded_at
          ? new Date(r.offer_responded_at as string).toISOString()
          : null,
        payment_status: (r.payment_status as string | null) ?? 'UNPAID',
        total_price: r.total_price !== null && r.total_price !== undefined ? Number(r.total_price) : 0,
        cancellation_reason: (r.cancellation_reason as string | null) ?? null,
        cancelled_by: (r.cancelled_by as string | null) ?? null,
        created_at: createdAt,
        age_minutes: Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000)),
        client: r.client_name
          ? { name: r.client_name as string, phone: r.client_phone as string | null }
          : null,
      };
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    // Rethrow: the admin requests panel must be able to tell "loaded, and there
    // are none" apart from "could not load". Returning [] would present a
    // database outage as an empty queue.
    throw error;
  }
}

export async function assignRequestToProvider(requestId: string, providerId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  try {
    const rows = await query(`
      UPDATE bookings
      SET provider_id = $1,
          status = 'DISPATCHED',
          provider_response = 'PENDING',
          provider_response_deadline = NOW() + INTERVAL '2 hours',
          provider_responded_at = NULL,
          total_price = COALESCE(quoted_price, total_price),
          updated_at = NOW()
      WHERE id = $2 AND status = 'PENDING'
      RETURNING *
    `, [providerId, requestId]);
    if (rows.length === 0) {
      // Another admin already claimed it — surface it instead of silently no-op'ing.
      throw new Error('الطلب تم تعيينه مسبقاً من طرف آخر');
    }
    const assigned = rows[0];
    await insertNotification({
      user_id: providerId,
      type: 'dispatch',
      message: 'تم إسناد مهمة جديدة إليك. لديك ساعتان للقبول أو الاعتذار.',
      link: '/dashboard/provider',
    });
    if (assigned.client_id && String(assigned.client_id) !== String(providerId)) {
      await insertNotification({
        user_id: String(assigned.client_id),
        type: 'status_update',
        message: 'تم تعيين مزوّد لطلبك، بانتظار تأكيده.',
        link: '/dashboard/client',
      });
    }
    await insertBookingEvent(
      String(assigned.id),
      admin.id,
      'ADMIN',
      'assigned',
      'تم تعيين مزوّد للطلب'
    );
    return assigned;
  } catch (error) {
    console.error('Error assigning request:', error);
    throw error;
  }
}

/**
 * Lets the admin decline a request that cannot be fulfilled (or is invalid),
 * so it stops occupying the pending queue. The client receives the reason.
 */
export async function declineRequest(requestId: string, reason?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  const cleanReason = reason?.trim().slice(0, 1000) || null;
  const rows = await query(`
    UPDATE bookings
    SET status = 'CANCELLED',
        cancellation_reason = COALESCE($2, 'رفضت الإدارة الطلب'),
        cancelled_by = 'ADMIN',
        offer_status = CASE WHEN offer_status = 'OFFERED' THEN 'DECLINED' ELSE offer_status END,
        updated_at = NOW()
    WHERE id = $1 AND status = 'PENDING'
    RETURNING *
  `, [requestId, cleanReason]);
  const declined = rows[0];
  if (declined) {
    if (declined.client_id) {
      await insertNotification({
        user_id: String(declined.client_id),
        type: 'status_update',
        message: cleanReason
          ? `تم رفض طلبك من الإدارة. السبب: ${cleanReason}`
          : 'تم رفض طلبك من الإدارة. يمكنك تعديله وإرساله مجدداً.',
        link: '/dashboard/client',
      });
    }
    await insertBookingEvent(
      String(declined.id),
      admin.id,
      'ADMIN',
      'declined',
      cleanReason ? `رفض الطلب: ${cleanReason}` : 'رفض الطلب'
    );
  }
  return declined ?? null;
}

/**
 * Lets the admin cancel a work order they previously dispatched, since a
 * mis-assignment is otherwise irreversible from the UI.
 */
export async function cancelDispatch(bookingId: string, reason?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  const cleanReason = reason?.trim().slice(0, 1000) || 'ألغت الإدارة أمر العمل';
  const rows = await query(`
    UPDATE bookings
    SET status = 'CANCELLED',
        cancellation_reason = COALESCE($2, 'ألغت الإدارة أمر العمل'),
        cancelled_by = 'ADMIN',
        updated_at = NOW()
    WHERE id = $1 AND status IN ('DISPATCHED', 'IN_PROGRESS')
    RETURNING *
  `, [bookingId, cleanReason]);
  const cancelled = rows[0];
  if (cancelled) {
    if (cancelled.client_id) {
      await insertNotification({
        user_id: String(cancelled.client_id),
        type: 'status_update',
        message: `تم إلغاء أمر العمل من الإدارة. السبب: ${cleanReason}`,
        link: '/dashboard/client',
      });
    }
    if (cancelled.provider_id) {
      await insertNotification({
        user_id: String(cancelled.provider_id),
        type: 'status_update',
        message: `تم إلغاء أمر العمل من الإدارة. السبب: ${cleanReason}`,
        link: '/dashboard/provider',
      });
    }
    await insertBookingEvent(
      String(cancelled.id),
      admin.id,
      'ADMIN',
      'cancelled',
      cleanReason
    );
  }
  return cancelled ?? null;
}

/** Admin sends a price/quotation (or an alternative proposal) to the client. */
export async function sendOffer(requestId: string, price: number, message?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error('أدخل سعراً صحيحاً');
  }
  const cleanMessage = message?.trim().slice(0, 1000) || null;
  const rows = await query(`
    UPDATE bookings
    SET quoted_price = $2,
        offer_message = $3,
        offer_status = 'OFFERED',
        offer_sent_at = NOW(),
        offer_responded_at = NULL,
        updated_at = NOW()
    WHERE id = $1 AND status = 'PENDING'
    RETURNING *
  `, [requestId, Math.round(numericPrice * 100) / 100, cleanMessage]);
  const offered = rows[0];
  if (!offered) throw new Error('لا يمكن تقديم عرض لهذا الطلب في حالته الحالية');
  if (offered.client_id) {
    await insertNotification({
      user_id: String(offered.client_id),
      type: 'offer',
      message: `قدّمت الإدارة عرضاً بقيمة ${Number(offered.quoted_price).toLocaleString('ar-DZ')} دج لطلبك.${
        cleanMessage ? ` ${cleanMessage}` : ''
      }`,
      link: '/dashboard/client',
    });
  }
  await insertBookingEvent(
    String(offered.id),
    admin.id,
    'ADMIN',
    'offer_sent',
    `عرض بسعر ${Number(offered.quoted_price)} دج`
  );
  return offered;
}

/** Client accepts or declines the admin's quotation. */
export async function respondToOffer(bookingId: string, accept: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const current = await query(`
    SELECT id, client_id, status, offer_status, quoted_price
    FROM bookings WHERE id = $1
  `, [bookingId]);
  const offer = current[0];
  if (!offer || String(offer.client_id) !== user.id) throw new Error('Forbidden');
  // An offer can still be answered after dispatch: admins may assign a provider
  // before the client replies, and the quotation remains binding.
  if (
    (offer.status !== 'PENDING' && offer.status !== 'DISPATCHED') ||
    offer.offer_status !== 'OFFERED'
  ) {
    throw new Error('لا يوجد عرض نشط لهذا الطلب');
  }
  const rows = await query(`
    UPDATE bookings
    SET offer_status = $2,
        offer_responded_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [bookingId, accept ? 'ACCEPTED' : 'DECLINED']);
  await insertBookingEvent(
    bookingId,
    user.id,
    'CLIENT',
    accept ? 'offer_accepted' : 'offer_declined',
    accept ? 'قبل العميل عرض الإدارة' : 'رفض العميل عرض الإدارة'
  );
  await notifyAdmins(
    accept
      ? `قبل العميل عرضاً بقيمة ${Number(offer.quoted_price).toLocaleString('ar-DZ')} دج.`
      : 'رفض العميل عرض الإدارة.',
    '/admin/dispatch'
  );
  return rows[0] ?? null;
}

/** Records the (simulated) payment confirmation for an accepted offer. */
export async function recordPayment(bookingId: string, method: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const allowedMethods = ['cash', 'card', 'transfer', 'baridi'];
  if (!allowedMethods.includes(method)) throw new Error('طريقة الدفع غير صالحة');
  const current = await query(`
    SELECT id, client_id, status, offer_status, quoted_price, payment_status
    FROM bookings WHERE id = $1
  `, [bookingId]);
  const booking = current[0];
  if (!booking || String(booking.client_id) !== user.id) throw new Error('Forbidden');
  if (booking.offer_status !== 'ACCEPTED') throw new Error('يجب قبول العرض قبل الدفع');
  if (!booking.quoted_price || Number(booking.quoted_price) <= 0) {
    throw new Error('لا يوجد مبلغ محدد للدفع');
  }
  if (booking.payment_status === 'PAID') return { ok: true, alreadyPaid: true };
  if (!['PENDING', 'DISPATCHED'].includes(String(booking.status))) {
    throw new Error('لا يمكن الدفع في هذه المرحلة');
  }
  await query(`
    UPDATE bookings
    SET payment_status = 'PAID',
        payment_method = $2,
        paid_at = NOW(),
        total_price = quoted_price,
        updated_at = NOW()
    WHERE id = $1
  `, [bookingId, method]);
  await insertBookingEvent(
    bookingId,
    user.id,
    'CLIENT',
    'payment_recorded',
    `تم تسجيل الدفع (${method})`
  );
  await notifyAdmins(
    `تم تسجيل دفع ${Number(booking.quoted_price).toLocaleString('ar-DZ')} دج لطلب مخصص.`,
    '/admin/dispatch'
  );
  return { ok: true, alreadyPaid: false };
}

/** Client cancels a request before work starts. */
export async function cancelClientRequest(bookingId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const cleanReason = reason?.trim().slice(0, 1000) || 'ألغى العميل الطلب';
  const rows = await query(`
    UPDATE bookings
    SET status = 'CANCELLED',
        cancellation_reason = $3,
        cancelled_by = 'CLIENT',
        offer_status = CASE WHEN offer_status = 'OFFERED' THEN 'DECLINED' ELSE offer_status END,
        updated_at = NOW()
    WHERE id = $1
      AND client_id = $2
      AND status IN ('PENDING', 'DISPATCHED')
    RETURNING *
  `, [bookingId, user.id, cleanReason]);
  const cancelled = rows[0];
  if (!cancelled) throw new Error('لا يمكن إلغاء هذا الطلب في حالته الحالية');
  await insertBookingEvent(
    bookingId,
    user.id,
    'CLIENT',
    'cancelled',
    cleanReason
  );
  await notifyAdmins(
    `ألغى العميل طلباً${cancelled.service_type === 'custom' ? ' مخصصاً' : ''}.`,
    '/admin/dispatch'
  );
  if (cancelled.provider_id) {
    await insertNotification({
      user_id: String(cancelled.provider_id),
      type: 'status_update',
      message: 'ألغى العميل المهمة التي أُسندت إليك.',
      link: '/dashboard/provider',
    });
  }
  return cancelled;
}

/** Client re-submits a rejected/cancelled request as a fresh pending request. */
export async function resubmitRequest(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const current = await query(`
    SELECT * FROM bookings WHERE id = $1 AND client_id = $2
  `, [bookingId, user.id]);
  const old = current[0];
  if (!old) throw new Error('الطلب غير موجود');
  if (old.status !== 'CANCELLED') throw new Error('يمكن إعادة إرسال الطلبات الملغاة فقط');

  const preferredDate =
    old.preferred_date && String(old.preferred_date).slice(0, 10) >= new Date().toISOString().slice(0, 10)
      ? String(old.preferred_date).slice(0, 10)
      : null;

  const rows = await query(`
    INSERT INTO bookings
      (client_id, provider_id, status, service_type, urgency, wilaya, notes, task,
       commune, budget_min, budget_max, preferred_date, attachments, created_at, updated_at)
    VALUES
      ($1, NULL, 'PENDING', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING id, status, created_at
  `, [
    user.id,
    old.service_type,
    old.urgency,
    old.wilaya,
    old.notes,
    old.task,
    old.commune,
    old.budget_min,
    old.budget_max,
    preferredDate,
    old.attachments ?? [],
  ]);
  const created = rows[0];
  await insertBookingEvent(
    String(created.id),
    user.id,
    'CLIENT',
    'created',
    'أُعيد إرسال طلب ملغى'
  );
  await notifyAdmins('أعاد عميل إرسال طلب كان مرفوضاً أو ملغى.', '/admin/dispatch');
  return created;
}

/** Full audit timeline for a request, visible to its client/provider/admin. */
export async function getRequestTimeline(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) return [];
  const booking = await query(`
    SELECT client_id, provider_id FROM bookings WHERE id = $1
  `, [bookingId]);
  if (booking.length === 0) return [];
  const row = booking[0];
  const allowed =
    user.role === 'ADMIN' ||
    String(row.client_id) === user.id ||
    String(row.provider_id) === user.id;
  if (!allowed) return [];
  const events = await query(`
    SELECT e.id, e.action, e.message, e.actor_role, e.created_at, p.full_name AS actor_name
    FROM booking_events e
    LEFT JOIN profiles p ON e.actor_id = p.id
    WHERE e.booking_id = $1
    ORDER BY e.created_at ASC
  `, [bookingId]);
  return events.map((event) => ({
    id: String(event.id),
    action: String(event.action),
    message: (event.message as string | null) ?? null,
    actor_role: (event.actor_role as string | null) ?? null,
    actor_name: (event.actor_name as string | null) ?? null,
    created_at: event.created_at
      ? new Date(event.created_at as string).toISOString()
      : new Date().toISOString(),
  }));
}

/** Provider accepts or declines an assignment within the response window. */
export async function respondToAssignment(bookingId: string, accept: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const current = await query(`
    SELECT id, client_id, provider_id, status, provider_response,
           provider_response_deadline, service_type, quoted_price
    FROM bookings WHERE id = $1
  `, [bookingId]);
  const booking = current[0];
  if (!booking || String(booking.provider_id) !== user.id) throw new Error('Forbidden');
  if (booking.status !== 'DISPATCHED') throw new Error('لم تعد هذه المهمة متاحة');

  const deadline = booking.provider_response_deadline
    ? new Date(booking.provider_response_deadline as string)
    : null;
  if (deadline && deadline.getTime() < Date.now()) {
    await releaseExpiredAssignments();
    throw new Error('انتهت مهلة الرد على هذه المهمة');
  }

  if (accept) {
    await query(`
      UPDATE bookings
      SET provider_response = 'ACCEPTED',
          provider_responded_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `, [bookingId]);
    await insertBookingEvent(
      bookingId,
      user.id,
      'PROVIDER',
      'provider_accepted',
      'قبل المزوّد المهمة'
    );
    await notifyAdmins('قبل المزوّد مهمة مُسندة إليه.', '/admin/dispatch');
    if (booking.client_id) {
      await insertNotification({
        user_id: String(booking.client_id),
        type: 'status_update',
        message: 'قبل المزوّد طلبك وسيبدأ العمل قريباً.',
        link: '/dashboard/client',
      });
    }
    return { ok: true, accepted: true };
  }

  const rows = await query(`
    UPDATE bookings
    SET status = 'PENDING',
        provider_id = NULL,
        provider_response = 'DECLINED',
        provider_responded_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [bookingId]);
  const released = rows[0];
  await insertBookingEvent(
    bookingId,
    user.id,
    'PROVIDER',
    'provider_declined',
    'اعتذر المزوّد عن المهمة'
  );
  await notifyAdmins('اعتذر المزوّد عن مهمة. أعد تعيينها.', '/admin/dispatch');
  if (booking.client_id) {
    await insertNotification({
      user_id: String(booking.client_id),
      type: 'status_update',
      message: 'تعذّر على المزوّد تنفيذ طلبك، وجارٍ تعيين مزوّد بديل.',
      link: '/dashboard/client',
    });
  }
  return { ok: true, accepted: false, released: Boolean(released) };
}

/** Count shown as a badge next to the admin dispatch link. */
export async function getAdminPendingCount() {
  const admin = await requireAdmin();
  if (!admin) return 0;
  await releaseExpiredAssignments();
  const rows = await query<{ count: string }>(`
    SELECT COUNT(*)::text AS count
    FROM bookings
    WHERE status = 'PENDING' AND provider_id IS NULL AND service_type IS NOT NULL
  `);
  return Number(rows[0]?.count ?? 0);
}

// ── Notifications ──────────────────────────────────────────────

/**
 * Internal, unguarded notification writer.
 * Not exported on purpose: every export in this file is a callable server
 * action, so exporting this would expose an unauthenticated insert to clients.
 * Only call this from a code path that has already authorized the actor.
 */
async function insertNotification(notifData: {
  user_id: string;
  type: string;
  message: string;
  listing_id?: string;
  link?: string;
}) {
  await query(`
    INSERT INTO notifications (user_id, type, message, listing_id, link, is_read, created_at)
    VALUES ($1, $2, $3, $4, $5, false, NOW())
  `, [
    notifData.user_id,
    notifData.type,
    notifData.message,
    notifData.listing_id || null,
    notifData.link || null,
  ]);
}

/** Notify every admin. Failures must never block the underlying action. */
async function notifyAdmins(message: string, link?: string) {
  try {
    const admins = await query<{ id: string }>(`SELECT id FROM profiles WHERE role = 'ADMIN'`);
    await Promise.all(
      admins.map((admin) =>
        insertNotification({
          user_id: String(admin.id),
          type: 'admin_alert',
          message,
          link,
        })
      )
    );
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

/** Internal, unguarded audit-trail writer. Call only after authorization. */
async function insertBookingEvent(
  bookingId: string,
  actorId: string | null,
  actorRole: string | null,
  action: string,
  message?: string
) {
  try {
    await query(`
      INSERT INTO booking_events (booking_id, actor_id, actor_role, action, message)
      VALUES ($1, $2, $3, $4, $5)
    `, [bookingId, actorId, actorRole, action, message || null]);
  } catch (error) {
    console.error('Error inserting booking event:', error);
  }
}

/**
 * Returns assignments whose provider response window elapsed back to the
 * pending queue so the admin can reassign them. Runs on read paths, which keeps
 * the queue healthy without a separate cron process.
 */
async function releaseExpiredAssignments() {
  try {
    const expired = await query<{
      id: string;
      client_id: string | null;
      provider_id: string;
      service_type: string | null;
    }>(`
      WITH due AS (
        SELECT id, client_id, provider_id, service_type
        FROM bookings
        WHERE status = 'DISPATCHED'
          AND provider_response = 'PENDING'
          AND provider_response_deadline IS NOT NULL
          AND provider_response_deadline < NOW()
        FOR UPDATE SKIP LOCKED
      )
      UPDATE bookings b
      SET status = 'PENDING',
          provider_id = NULL,
          provider_response = 'EXPIRED',
          provider_responded_at = NOW(),
          updated_at = NOW()
      FROM due
      WHERE b.id = due.id
      RETURNING b.id, due.client_id, due.provider_id, due.service_type
    `);

    for (const row of expired) {
      const bookingId = String(row.id);
      await insertBookingEvent(
        bookingId,
        null,
        'SYSTEM',
        'provider_timeout',
        'انتهت مهلة رد المزوّد وأُعيد الطلب إلى قائمة الانتظار'
      );
      await notifyAdmins(
        'انتهت مهلة رد مزوّد على طلب. أعد تعيينه من قائمة الطلبات.',
        '/admin/dispatch'
      );
      if (row.client_id) {
        await insertNotification({
          user_id: String(row.client_id),
          type: 'status_update',
          message: 'انتهت مهلة المزوّد، وسيتم تعيين مزوّد آخر لطلبك.',
          link: '/dashboard/client',
        });
      }
      if (row.provider_id) {
        await insertNotification({
          user_id: String(row.provider_id),
          type: 'status_update',
          message: 'انتهت مهلة الرد على المهمة، وتم سحبها منك.',
          link: '/dashboard/provider',
        });
      }
    }
  } catch (error) {
    console.error('Error releasing expired assignments:', error);
  }
}

/**
 * Public server action: notify another user.
 * The caller must be authenticated and must be able to reach the recipient —
 * currently limited to notifying a worker about one of your own listings or
 * your own booking, so nobody can spam arbitrary users.
 */
export async function createNotification(notifData: {
  user_id: string;
  type: string;
  message: string;
  listing_id?: string;
  booking_id?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  let allowed = false;
  if (notifData.listing_id) {
    const rows = await query(
      'SELECT user_id FROM listings WHERE id = $1',
      [notifData.listing_id]
    );
    // Either I own the listing, or I am the worker the listing belongs to.
    allowed = rows.length === 1 && (rows[0].user_id === user.id || rows[0].user_id === notifData.user_id);
  } else if (notifData.booking_id) {
    const rows = await query(
      'SELECT client_id, provider_id FROM bookings WHERE id = $1',
      [notifData.booking_id]
    );
    allowed =
      rows.length === 1 &&
      (rows[0].client_id === user.id || rows[0].provider_id === user.id || user.role === 'ADMIN');
  } else {
    // No relationship to prove — refuse rather than allow blind writes.
    allowed = false;
  }

  if (!allowed) throw new Error('Not allowed to notify this user');

  await insertNotification({
    user_id: notifData.user_id,
    type: notifData.type,
    message: notifData.message,
    listing_id: notifData.listing_id,
  });
}

export async function getUnreadNotificationCount() {
  const user = await getCurrentUser();
  if (!user) return 0;
  const rows = await query(
    'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = $1 AND is_read = false',
    [user.id]
  );
  return rows[0] ? Number(rows[0].cnt) : 0;
}

export async function getNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await query(`
    SELECT n.*, l.title as listing_title
    FROM notifications n
    LEFT JOIN listings l ON n.listing_id = l.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `, [user.id]);
  return rows;
}

export async function markNotificationRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  await query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
    [notificationId, user.id]
  );
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  await query('UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false', [user.id]);
}

export type SiteConfig = {
  company_name: string;
  company_name_en: string;
  company_name_fr: string;
  tagline: string;
  about_ar: string;
  about_en: string;
  about_fr: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_address_en: string;
  contact_address_fr: string;
  privacy_ar: string;
  privacy_en: string;
  privacy_fr: string;
  terms_ar: string;
  terms_en: string;
  terms_fr: string;
  maintenance_mode: boolean;
  auto_approve_providers: boolean;
  manual_listing_review: boolean;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  company_name: "بناء المستقبل",
  company_name_en: "Binaa Mostaqbal",
  company_name_fr: "Bâtiment Avenir",
  tagline: "كل ما تحتاجه للبناء في مكان واحد",
  about_ar: "منصة بَنّاي الرقمية - كل ما تحتاجه للبناء في مكان واحد. تجمع بين موردي المواد، أصحاب العتاد، وأفضل الحرفيين في جميع الولايات الـ 58.",
  about_en: "Binaa digital platform - everything you need for construction in one place. Bringing together material suppliers, equipment owners, and the best craftsmen across all 58 wilayas.",
  about_fr: "Plateforme numérique Binaa - tout ce dont vous avez besoin pour la construction en un seul endroit. Rassemble les fournisseurs de matériaux, les propriétaires d'équipement et les meilleurs artisans dans les 58 wilayas.",
  contact_phone: "+213 (0) 555 55 55 55",
  contact_email: "contact@binamostaqbal.dz",
  contact_address: "حي الأعمال، وسط المدينة",
  contact_address_en: "Business District, City Center",
  contact_address_fr: "Quartier d'affaires, Centre-ville",
  privacy_ar: "نحن في بناء المستقبل نلتزم بحماية خصوصية مستخدمينا. يتم جمع المعلومات الشخصية لغرض تحسين الخدمات فقط.",
  privacy_en: "At Binaa Mostaqbal, we are committed to protecting your privacy. Personal information is collected only for the purpose of improving services.",
  privacy_fr: "Chez Bâtiment Avenir, nous nous engageons à protéger votre vie privée. Les informations personnelles ne sont collectées que dans le but d'améliorer les services.",
  terms_ar: "باستخدام منصة بناء المستقبل، فإنك توافق على هذه الشروط والأحكام. تحتفظ المنصة بالحق في تعديل هذه الشروط في أي وقت.",
  terms_en: "By using the Binaa Mostaqbal platform, you agree to these terms and conditions. The platform reserves the right to modify these terms at any time.",
  terms_fr: "En utilisant la plateforme Bâtiment Avenir, vous acceptez ces conditions générales. La plateforme se réserve le droit de modifier ces conditions à tout moment.",
  maintenance_mode: false,
  auto_approve_providers: false,
  manual_listing_review: false,
};

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const rows = await query<{ config: SiteConfig }>('SELECT config FROM site_config WHERE id = 1');
    if (rows.length > 0) {
      return { ...DEFAULT_SITE_CONFIG, ...rows[0].config };
    }
  } catch (err) {
    // Only "table does not exist" is benign. Any other failure must surface,
    // otherwise a real outage silently reads as "no config" — which would
    // wrongly withhold provider approvals.
    const code = (err as { code?: string })?.code;
    if (code !== '42P01') {
      console.error('Error reading site config:', err);
      throw err;
    }
  }
  return DEFAULT_SITE_CONFIG;
}

export async function updateSiteConfig(partial: Partial<SiteConfig>) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  const current = await getSiteConfig();
  const config = { ...current, ...partial };
  await query(
    `UPDATE site_config SET config = $1::jsonb, updated_at = NOW() WHERE id = 1`,
    [JSON.stringify(config)]
  );
}

export async function getAdminStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  await releaseExpiredAssignments();

  const [totals] = await query<{
    total_users: string;
    total_listings: string;
    completed_orders: string;
    total_revenue: string | null;
    new_users_7d: string;
    new_listings_7d: string;
    revenue_30d: string | null;
    pending_requests: string;
    pending_custom_requests: string;
    avg_response_minutes: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM profiles)::text AS total_users,
      (SELECT COUNT(*) FROM listings)::text AS total_listings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'COMPLETED')::text AS completed_orders,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'COMPLETED')::text AS total_revenue,
      (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days')::text AS new_users_7d,
      (SELECT COUNT(*) FROM listings WHERE created_at >= NOW() - INTERVAL '7 days')::text AS new_listings_7d,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings
        WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '30 days')::text AS revenue_30d,
      (SELECT COUNT(*) FROM bookings
        WHERE status = 'PENDING' AND provider_id IS NULL AND service_type IS NOT NULL)::text AS pending_requests,
      (SELECT COUNT(*) FROM bookings
        WHERE status = 'PENDING' AND provider_id IS NULL AND service_type = 'custom')::text AS pending_custom_requests,
      (SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (e.created_at - b.created_at)) / 60)), 0)
        FROM booking_events e
        JOIN bookings b ON b.id = e.booking_id
        WHERE e.action = 'assigned'
          AND e.created_at >= NOW() - INTERVAL '30 days')::text AS avg_response_minutes
  `);

  // Per-day activity for the last 7 days, including days with no rows so the
  // chart does not silently skip them.
  const daily = await query<{ day: string; users: string; listings: string }>(`
    SELECT
      to_char(d.day, 'Dy') AS day,
      (SELECT COUNT(*) FROM profiles WHERE created_at::date = d.day)::text AS users,
      (SELECT COUNT(*) FROM listings WHERE created_at::date = d.day)::text AS listings
    FROM generate_series(NOW()::date - INTERVAL '6 days', NOW()::date, INTERVAL '1 day') AS d(day)
    ORDER BY d.day
  `);

  return {
    totalUsers: Number(totals?.total_users ?? 0),
    totalListings: Number(totals?.total_listings ?? 0),
    completedOrders: Number(totals?.completed_orders ?? 0),
    totalRevenue: Number(totals?.total_revenue ?? 0),
    revenue30d: Number(totals?.revenue_30d ?? 0),
    newUsers7d: Number(totals?.new_users_7d ?? 0),
    newListings7d: Number(totals?.new_listings_7d ?? 0),
    pendingRequests: Number(totals?.pending_requests ?? 0),
    pendingCustomRequests: Number(totals?.pending_custom_requests ?? 0),
    avgResponseMinutes: Number(totals?.avg_response_minutes ?? 0),
    daily: daily.map((r) => ({
      name: r.day,
      users: Number(r.users),
      listings: Number(r.listings),
    })),
  };
}

export async function getPendingProviders() {
  const admin = await requireAdmin();
  if (!admin) return [];
  const rows = await query(
    `SELECT p.id, p.full_name, p.phone, p.wilaya, p.provider_type, p.specialty, p.bio, p.created_at, u.email
     FROM public.profiles p
     JOIN auth.users u ON u.id = p.id
     WHERE p.role = 'PROVIDER' AND p.is_verified = false
     ORDER BY p.created_at DESC`,
  );
  return rows;
}

export async function approveProvider(providerId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  await query(
    `UPDATE public.profiles SET is_verified = true, updated_at = NOW() WHERE id = $1 AND role = 'PROVIDER'`,
    [providerId]
  );
  await insertNotification({
    user_id: providerId,
    type: 'provider_approved',
    message: 'تمت الموافقة على حسابك كمزود خدمة. يمكنك الآن الدخول إلى لوحة التحكم والبدء في نشر إعلاناتك.',
  });
}

// ── Admin Pages Real Data ──────────────────────────────────────

export async function getAllUsers() {
  const admin = await requireAdmin();
  if (!admin) return [];
  try {
    const rows = await query(`
      SELECT p.id, p.full_name, p.phone, p.wilaya, p.role, p.is_verified, p.provider_type, p.specialty, p.created_at, u.email
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
      ORDER BY p.created_at DESC
    `);
    return rows.map(r => ({
      id: r.id as string,
      name: (r.full_name as string) || 'غير محدد',
      email: r.email as string,
      role: r.role as string,
      is_verified: Boolean(r.is_verified),
      wilaya: r.wilaya != null ? Number(r.wilaya) : null,
      provider_type: r.provider_type as string | null,
      specialty: r.specialty as string | null,
      phone: r.phone as string | null,
      joined: r.created_at ? new Date(r.created_at as string).toISOString().split('T')[0] : '-',
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function getAllListings(page = 1, perPage = 20) {
  const admin = await requireAdmin();
  if (!admin) return { listings: [], total: 0, page: 1, perPage, totalPages: 0 };
  try {
    const offset = (page - 1) * perPage;
    const rows = await query(`
      SELECT l.*, p.full_name, p.avatar_url
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.id
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `, [perPage, offset]);

    const countResult = await query<Record<string, unknown>>('SELECT COUNT(*)::int AS cnt FROM listings');
    const total = Number(countResult[0]?.cnt) || 0;

    return {
      listings: rows.map(r => ({
        id: r.id as string,
        title: r.title as string,
        category: r.category as string,
        provider_name: (r.full_name as string) || 'غير معروف',
        provider_avatar: r.avatar_url as string | null,
        price: Number(r.price) || 0,
        price_type: r.price_type as string | null,
        wilaya: r.wilaya != null ? Number(r.wilaya) : null,
        is_available: Boolean(r.is_available),
        views_count: Number(r.views_count) || 0,
        created_at: r.created_at ? new Date(r.created_at as string).toISOString().split('T')[0] : '-',
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  } catch (error) {
    console.error('Error fetching all listings:', error);
    return { listings: [], total: 0, page: 1, perPage, totalPages: 0 };
  }
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return false;
  try {
    await query('DELETE FROM public.profiles WHERE id = $1', [userId]);
    await query('DELETE FROM auth.users WHERE id = $1', [userId]);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export async function approveListing(listingId: string) {
  const admin = await requireAdmin();
  if (!admin) return false;
  try {
    await query('UPDATE listings SET is_available = true WHERE id = $1', [listingId]);
    return true;
  } catch (error) {
    console.error('Error approving listing:', error);
    return false;
  }
}

export async function rejectListing(listingId: string) {
  const admin = await requireAdmin();
  if (!admin) return false;
  try {
    await query('UPDATE listings SET is_available = false WHERE id = $1', [listingId]);
    return true;
  } catch (error) {
    console.error('Error rejecting listing:', error);
    return false;
  }
}

export async function rejectProvider(providerId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  await query(
    `UPDATE public.profiles SET is_verified = false, updated_at = NOW() WHERE id = $1`,
    [providerId]
  );
  await insertNotification({
    user_id: providerId,
    type: 'provider_rejected',
    message: 'نأسف، لم يتم قبول طلب تسجيلك كمزود خدمة. يمكنك التواصل مع فريق الدعم لمعرفة السبب.',
  });
}

