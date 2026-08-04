"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type Locale = "ar" | "en" | "fr";

const LOCALE_STORAGE_KEY = "bannay_locale";

const translations: Record<Locale, () => Promise<Record<string, unknown>>> = {
  ar: () => import("@/locales/ar.json").then(m => m.default),
  en: () => import("@/locales/en.json").then(m => m.default),
  fr: () => import("@/locales/fr.json").then(m => m.default),
};

const DIR_BY_LOCALE: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  fr: "ltr",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType>({
  locale: "ar",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "ar";
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    return stored || "ar";
  });
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    document.documentElement.dir = DIR_BY_LOCALE[locale];
    document.documentElement.lang = locale;
    translations[locale]().then(m => {
      if (active) {
        setMessages(m);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split(".");
    let value: unknown = messages;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  }, [messages]);

  if (!loaded) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: DIR_BY_LOCALE[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

export type { Locale };
