"use client";

import { useTranslation, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Switch language"
      >
        <Globe size={16} />
        <span className="text-xs font-bold uppercase">{locale}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 py-1 min-w-[120px]">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={cn(
                  "w-full px-4 py-2 text-right text-sm font-medium transition-colors hover:bg-primary/5",
                  locale === l.code ? "text-primary" : "text-muted-foreground"
                )}
              >
                {l.native}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
