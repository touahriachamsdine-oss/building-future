"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getPendingProviders, approveProvider, rejectProvider } from "@/lib/db";
import { useAdminGuard } from "@/lib/use-admin";
import { Search, CheckCircle, XCircle, Loader2, MapPin, Mail, Phone, Calendar } from "lucide-react";

type PendingProvider = {
  id: string;
  full_name: string;
  phone: string | null;
  wilaya: number | null;
  provider_type: string | null;
  specialty: string | null;
  bio: string | null;
  email: string;
  created_at: string;
};

const PROVIDER_LABELS: Record<string, string> = {
  CRAFTSMAN: "حرفي",
  MATERIAL_SUPPLIER: "مورد مواد",
  EQUIPMENT_OWNER: "صاحب عتاد",
  TRANSPORTER: "ناقل",
};

export default function ApproveProviders() {
  const { isAdmin, loading: guardLoading } = useAdminGuard();
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    getPendingProviders()
      .then((data) => {
        if (active) setProviders(data as unknown as PendingProvider[]);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveProvider(id);
      setProviders(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectProvider(id);
      setProviders(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = providers.filter(p =>
    !search || p.full_name.includes(search) || p.email.includes(search)
  );

  if (guardLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2">الموافقة على المزودين</h1>
        <p className="text-muted-foreground">مراجعة واعتماد حسابات المزودين الجدد</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          className="pr-12"
          placeholder="بحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {search ? "لا توجد نتائج للبحث" : "لا يوجد مزودون في انتظار الموافقة"}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg shrink-0">
                        {p.full_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{p.full_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {PROVIDER_LABELS[p.provider_type || ""] || p.provider_type || "مزود"}
                          {p.specialty && ` — ${p.specialty}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail size={14} /> {p.email}</span>
                      {p.phone && <span className="flex items-center gap-1" dir="ltr"><Phone size={14} /> {p.phone}</span>}
                      {p.wilaya && <span className="flex items-center gap-1"><MapPin size={14} /> ولاية {p.wilaya}</span>}
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(p.created_at).toLocaleDateString("ar-DZ")}</span>
                    </div>

                    {p.bio && (
                      <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 leading-relaxed">
                        {p.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="brutal"
                      size="sm"
                      className="gap-1"
                      disabled={actionLoading === p.id}
                      onClick={() => handleApprove(p.id)}
                    >
                      {actionLoading === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      موافقة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                      disabled={actionLoading === p.id}
                      onClick={() => handleReject(p.id)}
                    >
                      <XCircle size={14} />
                      رفض
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
