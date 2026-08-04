"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  User, 
  Settings,
  Bell,
  Search,
  Loader2,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, signOutAction } from "@/lib/auth";

const PROVIDER_LINKS = [
  { title: "نظرة عامة", href: "/dashboard/provider", icon: LayoutDashboard },
  { title: "إعلاناتي", href: "/dashboard/provider/listings", icon: Package },
  { title: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  { title: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

const CLIENT_LINKS = [
  { title: "طلباتي", href: "/dashboard/client", icon: LayoutDashboard },
  { title: "الرسائل", href: "/dashboard/provider/messages", icon: MessageSquare }, // Reusing messages
  { title: "الملف الشخصي", href: "/dashboard/profile", icon: User },
  { title: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const user = await getCurrentUser();
      if (user) {
        setRole(user.role || 'CLIENT');
      }
      setIsLoading(false);
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await signOutAction();
    router.push("/login");
  };

  const navLinks = role === 'PROVIDER' ? PROVIDER_LINKS : CLIENT_LINKS;

  return (
    <div className="flex h-screen bg-background overflow-hidden text-right" dir="rtl">
      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 lg:hidden flex flex-col"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-primary-foreground shadow-brutal shrink-0">
                    <span className="text-primary-foreground font-bold text-xl">ب</span>
                  </div>
                  <span className="font-black text-xl truncate text-foreground">Bannay — بناء</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-background border border-border text-foreground rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      )}
                    >
                      <link.icon size={20} />
                      <span className="font-bold">{link.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold"
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-72 border-l border-border bg-card hidden lg:flex flex-col">
        <div className="p-8 border-b border-border">
           <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center border-2 border-primary-foreground shadow-brutal shrink-0">
                 <span className="text-primary-foreground font-bold text-xl">ب</span>
              </div>
              <span className="font-black text-xl truncate text-foreground">Bannay — بناء</span>
           </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
           {isLoading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-muted-foreground" />
             </div>
           ) : navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                >
                  <link.icon size={20} />
                  <span className="font-bold">{link.title}</span>
                </Link>
              );
           })}
        </nav>

        <div className="p-6">
           <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 space-y-4">
              <div className="font-bold text-primary">هل تحتاج لمساعدة؟</div>
              <p className="text-xs text-muted-foreground leading-relaxed">فريق الدعم الفني متواجد لمساعدتك في نجاح مشروعك.</p>
              <Button variant="outline" className="w-full text-xs h-9 bg-card border-primary/20 text-foreground hover:bg-primary/10">مركز الدعم</Button>
           </div>
        </div>
         <div className="p-6 border-t border-border mt-auto">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-96 hidden md:block">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  className="w-full h-11 bg-background border border-border text-foreground rounded-xl pr-12 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-right" 
                  placeholder="ابحث في لوحة التحكم..."
                />
              </div>
           </div>
           
           <div className="flex items-center gap-4">
               <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2.5 bg-background border border-border text-foreground rounded-xl hover:bg-primary/10 transition-colors"
               >
                  <Menu size={20} />
               </button>
               <button className="p-2.5 bg-background border border-border text-foreground rounded-xl hover:bg-primary/10 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary">
                 {role?.[0] || 'U'}
              </div>
           </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
