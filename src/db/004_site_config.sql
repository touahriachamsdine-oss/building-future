CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_config (id, config) VALUES (1, '{
  "company_name": "بناء المستقبل",
  "company_name_en": "Binaa Mostaqbal",
  "company_name_fr": "Bâtiment Avenir",
  "tagline": "كل ما تحتاجه للبناء في مكان واحد",
  "about_ar": "منصة بَنّاي الرقمية - كل ما تحتاجه للبناء في مكان واحد. تجمع بين موردي المواد، أصحاب العتاد، وأفضل الحرفيين في جميع الولايات الـ 58.",
  "about_en": "Binaa digital platform - everything you need for construction in one place. Bringing together material suppliers, equipment owners, and the best craftsmen across all 58 wilayas.",
  "about_fr": "Plateforme numérique Binaa - tout ce dont vous avez besoin pour la construction en un seul endroit. Rassemble les fournisseurs de matériaux, les propriétaires d'équipement et les meilleurs artisans dans les 58 wilayas.",
  "contact_phone": "+213 (0) 555 55 55 55",
  "contact_email": "contact@binamostaqbal.dz",
  "contact_address": "حي الأعمال، وسط المدينة",
  "contact_address_en": "Business District, City Center",
  "contact_address_fr": "Quartier d'affaires, Centre-ville",
  "privacy_ar": "نحن في بناء المستقبل نلتزم بحماية خصوصية مستخدمينا. يتم جمع المعلومات الشخصية لغرض تحسين الخدمات فقط.",
  "privacy_en": "At Binaa Mostaqbal, we are committed to protecting your privacy. Personal information is collected only for the purpose of improving services.",
  "privacy_fr": "Chez Bâtiment Avenir, nous nous engageons à protéger votre vie privée. Les informations personnelles ne sont collectées que dans le but d'améliorer les services.",
  "terms_ar": "باستخدام منصة بناء المستقبل، فإنك توافق على هذه الشروط والأحكام. تحتفظ المنصة بالحق في تعديل هذه الشروط في أي وقت.",
  "terms_en": "By using the Binaa Mostaqbal platform, you agree to these terms and conditions. The platform reserves the right to modify these terms at any time.",
  "terms_fr": "En utilisant la plateforme Bâtiment Avenir, vous acceptez ces conditions générales. La plateforme se réserve le droit de modifier ces conditions à tout moment.",
  "maintenance_mode": false,
  "auto_approve_providers": false,
  "manual_listing_review": false
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
