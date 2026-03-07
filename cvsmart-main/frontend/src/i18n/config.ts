export const locales = ["en", "am", "om"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afan Oromo",
};

export const defaultLocale: Locale = "en";

export const COOKIE_NAME = "NEXT_LOCALE";

export function getLocaleFromCookie(cookieHeader: string | null): Locale {
  if (!cookieHeader) return defaultLocale;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  if (value && locales.includes(value as Locale)) return value as Locale;
  return defaultLocale;
}
