"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import { Hammer, Truck, Package, Search, Menu, X, Users, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ThemeToggle";
import { getCurrentUser } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const navLinks = [
    { title: t("nav.building_materials"), href: "/categories/building-materials", icon: Package },
    { title: t("nav.equipment_tools"), href: "/categories/equipment-tools", icon: Truck },
    { title: t("nav.craftsmen"), href: "/categories/craftsmen", icon: Hammer },
    { title: t("nav.sellers"), href: "/sellers", icon: Users },
    { title: t("nav.waste_recycling"), href: "/categories/waste-recycling", icon: Search },
  ];

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "PROVIDER" ? "/dashboard/provider" : "/dashboard/client";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md texture-grain">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-12 w-auto flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/images/logo_transparent.png" 
              alt={t("common.app_name")}
              width={48}
              height={48}
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              <link.icon size={18} />
              {link.title}
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationBell />
          {user ? (
            <Link href={dashboardHref}>
              <Button variant="ghost" className="text-sm gap-2">
                <LayoutDashboard size={16} />
                {t("common.dashboard")}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm">{t("common.login")}</Button>
              </Link>
              <Link href="/signup">
                <Button variant="brutal" size="sm">{t("nav.join_now")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute w-full bg-background border-b border-white/5 p-4 space-y-4 transition-all duration-300",
        isOpen ? "top-20 opacity-100" : "-top-96 opacity-0 pointer-events-none"
      )}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 text-lg font-medium p-3 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <link.icon size={20} />
            {link.title}
          </Link>
        ))}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium">{t("nav.theme")}</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium">{t("common.notifications")}</span>
            <NotificationBell />
          </div>
          {user ? (
            <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
              <Button variant="brutal" className="w-full gap-2">
                <LayoutDashboard size={18} />
                {t("common.dashboard")}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">{t("common.login")}</Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button variant="brutal" className="w-full">{t("nav.join_now")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
