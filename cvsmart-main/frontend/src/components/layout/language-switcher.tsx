"use client";

import { useLocaleSwitch } from "@/components/providers/i18n-provider";
import { type Locale, locales, localeNames } from "@/i18n/config";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleSwitch();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? "secondary" : "ghost"}
          size="sm"
          className="rounded-full px-3 text-xs font-medium"
          onClick={() => setLocale(loc as Locale)}
          aria-label={`Switch to ${localeNames[loc]}`}
        >
          {loc === "en" ? "EN" : loc === "am" ? "አማ" : "OM"}
        </Button>
      ))}
    </div>
  );
}
