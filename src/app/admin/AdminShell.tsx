"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOutAction } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  AlertCircle,
  LogOut,
  SendToBack,
  Menu,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { title: "نظرة عامة", href: "/admin", icon: LayoutDashboard },
  { title: "المستخدمين", href: "/admin/users", icon: Users },
  { title: "الموافقة على المزودين", href: "/admin/users/approve", icon: UserCheck },
  { title: "الإعلانات", href: "/admin/listings", icon: FileText },
  { title: "إرسال أوامر", href: "/admin/dispatch", icon: SendToBack },
  { title: "الإحصائيات", href: "/admin/analytics", icon: BarChart3 },
  { title: "البلاغات", href: "/admin/reports", icon: AlertCircle },
  { title: "الإعدادات", href: "/admin/settings", icon: Settings },
];

function SidebarContent({
  links,
  currentPath,
  onLogout,
  onClose,
}: {
  links: { title: string; href: string; icon: React.ElementType }[];
  currentPath: string;
  onLogout: () => Promise<void>;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
           <span className="text-white font-bold">ب</span>
        </div>
        <span className="font-black tracking-tight text-foreground">لوحة التحكم</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = currentPath === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-medium">{link.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => { onLogout(); onClose?.(); }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileMenuOpen(false);
  }

  const handleLogout = async () => {
    await signOutAction();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-64 border-l border-border bg-card flex-col shadow-sm">
        <SidebarContent
          links={sidebarLinks}
          currentPath={pathname}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar — Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-64 z-50 border-l border-border bg-card flex flex-col shadow-xl lg:hidden"
            >
              <SidebarContent
                links={sidebarLinks}
                currentPath={pathname}
                onLogout={handleLogout}
                onClose={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/80 backdrop-blur-md">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-4">
             <h2 className="text-xl font-bold text-foreground">أهلاً بك، المشرف</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shadow-sm">
                A
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
