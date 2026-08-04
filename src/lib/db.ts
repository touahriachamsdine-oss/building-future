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

    if (!rows || rows.length === 0) {
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

    return rows.map(r => ({
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
        full_name: r.full_name || 'مستخدم غير معروف',
        avatar_url: r.avatar_url,
        rating_avg: r.rating_avg ? Number(r.rating_avg) : 5.0
      }
    }));
  } catch (error) {
    console.error('Error fetching listings:', error);
    return MOCK_LISTINGS.filter(item => {
      if (filters?.category && filters.category !== 'all' && filters.category !== 'الكل') {
        if (item.category !== filters.category) return false;
      }
      if (filters?.wilaya && !isNaN(filters.wilaya)) {
        if (item.wilaya !== filters.wilaya) return false;
      }
      if (filters?.search) {
        if (!item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
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
  client_id: string;
  provider_id: string;
  listing_id: string;
  total_price: number;
  notes?: string;
}) {
  try {
    const rows = await query(`
      INSERT INTO bookings (client_id, provider_id, listing_id, status, total_price, notes, created_at)
      VALUES ($1, $2, $3, 'PENDING', $4, $5, NOW())
      RETURNING *
    `, [
      bookingData.client_id,
      bookingData.provider_id,
      bookingData.listing_id,
      bookingData.total_price,
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
  provider_id: string | null;       // null = unassigned, admin assigns later
  service_type: string;
  urgency: string;
  wilaya: number;
  notes?: string;
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  try {
    // If provider_id is provided use it as client_id too (admin-initiated command).
    // The real client reference isn't meaningful here — the booking represents a
    // work command, not a marketplace transaction.
    const rows = await query(`
      INSERT INTO bookings
        (client_id, provider_id, status, service_type, urgency, wilaya, notes, created_at)
      VALUES
        (COALESCE($1, (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)),
         $2, 'DISPATCHED', $3, $4, $5, $6, NOW())
      RETURNING *
    `, [
      data.provider_id, // $1 — client_id (COALESCE falls back to admin profile)
      data.provider_id, // $2 — provider_id (nullable)
      data.service_type,
      data.urgency,
      data.wilaya,
      data.notes ?? null,
    ]);
    if (data.provider_id) {
      await createNotification({
        user_id: data.provider_id,
        type: 'dispatch',
        message: 'تم إرسال أمر عمل جديد إليك',
      });
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
  try {
    const rows = await query(`
      SELECT
        b.id, b.service_type, b.urgency, b.wilaya, b.status, b.notes,
        b.created_at,
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
    service_type: r.service_type as string | null,
    urgency: r.urgency as string | null,
    wilaya: r.wilaya ? Number(r.wilaya) : null,
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
    service_type: r.service_type as string | null,
    urgency: r.urgency as string | null,
    wilaya: r.wilaya ? Number(r.wilaya) : null,
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

export async function updateBookingStatus(bookingId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  const rows = await query(`
    UPDATE bookings 
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND (provider_id = $3 OR client_id = $3)
    RETURNING *
  `, [status, bookingId, user.id]);
  if (rows.length > 0) {
    const booking = rows[0];
    const isProvider = booking.provider_id && String(booking.provider_id) === user.id;
    const hasClient = booking.client_id && String(booking.client_id) !== user.id;
    if (isProvider && hasClient) {
      const message =
        status === 'IN_PROGRESS'
          ? 'بدأ المزود العمل على طلبك'
          : status === 'COMPLETED'
          ? 'تم إكمال طلبك بنجاح'
          : status === 'CANCELLED'
          ? 'تم إلغاء الطلب من طرف المزود'
          : `تحديث حالة الطلب: ${status}`;
      await createNotification({
        user_id: String(booking.client_id),
        type: 'status_update',
        message,
      });
    }
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

export async function createClientRequest(data: {
  service_type: string;
  urgency: string;
  wilaya: number;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  try {
    const rows = await query(`
      INSERT INTO bookings (client_id, provider_id, status, service_type, urgency, wilaya, notes, created_at)
      VALUES ($1, NULL, 'PENDING', $2, $3, $4, $5, NOW())
      RETURNING id, status, created_at
    `, [user.id, data.service_type, data.urgency, data.wilaya, data.notes ?? null]);
    return rows[0];
  } catch (error) {
    console.error('Error creating client request:', error);
    throw error;
  }
}

export async function getPendingRequests() {
  const admin = await requireAdmin();
  if (!admin) return [];
  try {
    const rows = await query(`
      SELECT
        b.id, b.service_type, b.urgency, b.wilaya, b.notes, b.created_at,
        p.full_name AS client_name,
        p.phone AS client_phone
      FROM bookings b
      LEFT JOIN profiles p ON b.client_id = p.id
      WHERE b.status = 'PENDING'
        AND b.provider_id IS NULL
        AND b.service_type IS NOT NULL
      ORDER BY b.created_at DESC
    `);
    return rows.map(r => ({
      id: r.id as string,
      service_type: r.service_type as string,
      urgency: r.urgency as string,
      wilaya: Number(r.wilaya),
      notes: r.notes as string | null,
      created_at: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
      client: r.client_name
        ? { name: r.client_name as string, phone: r.client_phone as string | null }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

export async function assignRequestToProvider(requestId: string, providerId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Forbidden: admin only');
  try {
    const rows = await query(`
      UPDATE bookings
      SET provider_id = $1, status = 'DISPATCHED', updated_at = NOW()
      WHERE id = $2 AND status = 'PENDING'
      RETURNING id, status
    `, [providerId, requestId]);
    if (rows.length > 0) {
      await createNotification({
        user_id: providerId,
        type: 'dispatch',
        message: 'تم إرسال أمر عمل جديد إليك',
      });
    }
    return rows[0] ?? null;
  } catch (error) {
    console.error('Error assigning request:', error);
    throw error;
  }
}

// ── Notifications ──────────────────────────────────────────────

export async function createNotification(notifData: {
  user_id: string;
  type: string;
  message: string;
  listing_id?: string;
}) {
  await query(`
    INSERT INTO notifications (user_id, type, message, listing_id, is_read, created_at)
    VALUES ($1, $2, $3, $4, false, NOW())
  `, [notifData.user_id, notifData.type, notifData.message, notifData.listing_id || null]);
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
  await query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
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
  } catch {
    // table may not exist yet
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
  await createNotification({
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
  await createNotification({
    user_id: providerId,
    type: 'provider_rejected',
    message: 'نأسف، لم يتم قبول طلب تسجيلك كمزود خدمة. يمكنك التواصل مع فريق الدعم لمعرفة السبب.',
  });
}

