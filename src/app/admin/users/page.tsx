import { getAllUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, Shield, Mail, MapPin, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function UsersManagement() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }
  const users = await getAllUsers();

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">تتبع وتحكم في جميع الحسابات المسجلة على المنصة</p>
        </div>
        <Button variant="brutal" className="h-11">إضافة مستخدم جديد</Button>
      </div>

      <Card className="border-border overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input className=" bg-background pr-12" placeholder="البحث بالاسم أو البريد الإلكتروني..." />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Button variant="outline" className="flex-1 md:flex-none gap-2">
                  <Filter size={18} /> تصفية
               </Button>
               <Button variant="outline" className="flex-1 md:flex-none gap-2">
                  <Shield size={18} /> الصلاحيات
               </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm">المستخدم</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm">الدور</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm">الحالة</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm">الولاية</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm">تاريخ الانضمام</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-sm"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      لا يوجد مستخدمين بعد
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                           {user.name[0] || 'م'}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </div>
                          {user.provider_type && (
                            <div className="text-[10px] text-muted-foreground">{user.provider_type}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        user.role === 'PROVIDER' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : 
                        user.role === 'ADMIN' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                        "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      )}>
                        {user.role === 'PROVIDER' ? 'مزود خدمة' : user.role === 'ADMIN' ? 'مشرف' : 'زبون'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          user.is_verified ? "bg-emerald-500" : "bg-orange-500"
                        )} />
                        <span className="text-sm font-medium">
                          {user.is_verified ? 'نشط' : 'قيد الانتظار'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {user.wilaya ? `ولاية ${user.wilaya}` : 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Link href={`/admin/users/${user.id}`} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreVertical size={18} />
                         </Link>
                         <form action={`/api/admin/delete-user`} method="POST" className="inline">
                           <input type="hidden" name="userId" value={user.id} />
                           <button type="submit" className="p-2 hover:bg-red-500/10 rounded-lg text-red-500">
                             <Trash2 size={18} />
                           </button>
                         </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        <div className="p-6 border-t border-border flex items-center justify-between">
           <div className="text-sm text-muted-foreground">إجمالي المستخدمين: {users.length}</div>
        </div>
      </Card>
    </div>
  );
}
