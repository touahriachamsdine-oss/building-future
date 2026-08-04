import { getProfile } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Mail, MapPin, Phone, Shield, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'زبون',
  PROVIDER: 'مزود خدمة',
  ADMIN: 'مشرف',
};

const WILAYAS: Record<number, string> = {
  1: 'أدرار', 2: 'الشلف', 3: 'الأغواط', 4: 'أم البواقي', 5: 'باتنة',
  6: 'بجاية', 7: 'بسكرة', 8: 'بشار', 9: 'البليدة', 10: 'البويرة',
  11: 'تمنراست', 12: 'تبسة', 13: 'تلمسان', 14: 'تيارت', 15: 'تيزي وزو',
  16: 'الجزائر', 17: 'الجلفة', 18: 'جيجل', 19: 'سطيف', 20: 'سعيدة',
  21: 'سكيكدة', 22: 'سيدي بلعباس', 23: 'عنابة', 24: 'قالمة', 25: 'قسنطينة',
  26: 'المدية', 27: 'مستغانم', 28: 'المسيلة', 29: 'معسكر', 30: 'ورقلة',
  31: 'وهران', 32: 'البيض', 33: 'إليزي', 34: 'برج بوعريريج', 35: 'بومرداس',
  36: 'الطارف', 37: 'تندوف', 38: 'تيسمسيلت', 39: 'الوادي', 40: 'خنشلة',
  41: 'سوق أهراس', 42: 'تيبازة', 43: 'ميلة', 44: 'عين الدفلى', 45: 'النعامة',
  46: 'عين تموشنت', 47: 'غرداية', 48: 'غليزان', 49: 'تميمون', 50: 'برج باجي مختار',
  51: 'أولاد جلال', 52: 'بني عباس', 53: 'عين صالح', 54: 'عين قزام', 55: 'تقرت',
  56: 'جانت', 57: 'المغير', 58: 'المنيعة',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailPage({ params }: Props) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();

  return (
    <div className="space-y-8" dir="rtl">
      <Link href="/admin/users" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium">
        <ChevronRight size={16} />
        العودة للمستخدمين
      </Link>

      <Card className="border-border max-w-2xl">
        <CardHeader className="p-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-xl">
              {((profile.full_name as string)?.[0] || 'م')}
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">{profile.full_name as string || 'غير محدد'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {ROLE_LABELS[profile.role as string] || profile.role as string}
                </span>
                <span className="text-sm text-muted-foreground">{profile.email as string}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium text-foreground">{profile.email as string || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Phone size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium text-foreground">{profile.phone as string || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الولاية</p>
                <p className="font-medium text-foreground">
                  {profile.wilaya ? WILAYAS[profile.wilaya as number] || `ولاية ${profile.wilaya}` : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">حالة الحساب</p>
                <p className="font-medium text-foreground">
                  {profile.is_verified ? 'موثق ✓' : 'قيد الانتظار'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">تاريخ التسجيل</p>
                <p className="font-medium text-foreground">
                  {profile.created_at ? new Date(profile.created_at as string).toLocaleDateString('ar-DZ') : '-'}
                </p>
              </div>
            </div>

            {(profile.provider_type as string) && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نوع المزود</p>
                  <p className="font-medium text-foreground">{profile.provider_type as string}</p>
                </div>
              </div>
            )}
          </div>

          {(profile.bio as string) && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">نبذة</p>
              <p className="text-foreground">{profile.bio as string}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
