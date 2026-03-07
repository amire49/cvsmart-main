"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type Locale, locales, defaultLocale, COOKIE_NAME } from "@/i18n/config";
import en from "@/messages/en.json";
import am from "@/messages/am.json";
import om from "@/messages/om.json";

const messagesMap: Record<Locale, typeof en> = { en, am, om };

type LocaleContextType = { locale: Locale; setLocale: (l: Locale) => void };
const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}

function getLocaleFromDocument(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  if (value && locales.includes(value as Locale)) return value as Locale;
  return defaultLocale;
}

export function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=31536000`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getLocaleFromDocument());
    setMounted(true);
  }, []);

  const handleLocaleChange = useCallback((newLocale: Locale) => {
    setLocaleCookie(newLocale);
    setLocaleState(newLocale);
  }, []);

  const messages = messagesMap[locale] ?? en;

  if (!mounted) {
    return (
      <NextIntlClientProvider locale={defaultLocale} messages={en} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <LocaleContext.Provider value={{ locale, setLocale: handleLocaleChange }}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}

