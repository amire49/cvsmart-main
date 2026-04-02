"use client";

import Link from "next/link";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const AVATAR_UPDATED_EVENT = "cvsmart:avatar-updated";

function oauthAvatarFromUser(user: Session["user"] | undefined): string | null {
  if (!user?.user_metadata) return null;
  const m = user.user_metadata as Record<string, unknown>;
  if (typeof m.picture === "string" && m.picture) return m.picture;
  if (typeof m.avatar_url === "string" && m.avatar_url) return m.avatar_url;
  return null;
}

const AccountAvatarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { avatarUrl: string | null }
>(function AccountAvatarTrigger({ avatarUrl, className, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full h-10 w-10 p-0 ring-1 ring-border hover:ring-accent focus-visible:ring-ring shrink-0",
        className
      )}
      aria-label="Open account menu"
      {...props}
    >
      <Avatar className="h-9 w-9 rounded-full border-2 border-transparent">
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt=""
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <AvatarFallback className="bg-accent text-accent-foreground rounded-full text-sm font-medium">
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </Button>
  );
});
AccountAvatarTrigger.displayName = "AccountAvatarTrigger";

export function MainNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const syncFromSession = useCallback(
    async (session: Session | null) => {
      const signedIn = !!session;
      setIsSignedIn(signedIn);
      if (!signedIn || !session?.user) {
        setUserEmail(null);
        setAvatarUrl(null);
        return;
      }
      setUserEmail(session.user.email ?? null);
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const dbUrl = profile?.avatar_url ?? null;
        setAvatarUrl(dbUrl ?? oauthAvatarFromUser(session.user));
      } catch (error) {
        console.error("Error loading profile for nav:", error);
        setAvatarUrl(oauthAvatarFromUser(session.user));
      }
    },
    [supabase]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) await syncFromSession(session);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncFromSession(session);
      setIsLoading(false);
    });

    const onAvatarUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ url?: string | null }>;
      if (ce.detail && "url" in ce.detail) {
        setAvatarUrl(ce.detail.url ?? null);
        return;
      }
      void supabase.auth
        .getSession()
        .then(({ data: { session } }) => syncFromSession(session));
    };
    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated);
    };
  }, [supabase, syncFromSession]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsSignedIn(false);
      setUserEmail(null);
      setAvatarUrl(null);
      setMobileOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinkClass =
    "text-muted-foreground hover:text-foreground transition-colors";
  const mobileNavLinkClass = `${navLinkClass} block py-3 text-base border-b border-border`;

  const closeMobile = () => setMobileOpen(false);

  const accountMenuItems = (
    <>
      {userEmail && (
        <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground truncate">
          {userEmail}
        </div>
      )}
      {userEmail && <DropdownMenuSeparator className="bg-border my-1" />}
      <DropdownMenuItem
        onSelect={() => router.push("/dashboard")}
        className="rounded-lg py-2.5 cursor-pointer focus:bg-accent flex items-center gap-2"
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        <span>{t("dashboard")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => router.push("/profile")}
        className="rounded-lg py-2.5 cursor-pointer focus:bg-accent flex items-center gap-2"
      >
        <User className="h-4 w-4 shrink-0" />
        <span>{t("profile")}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => router.push("/setting")}
        className="rounded-lg py-2.5 cursor-pointer focus:bg-accent flex items-center gap-2"
      >
        <Settings className="h-4 w-4 shrink-0" />
        <span>{t("settings")}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border my-1" />
      <DropdownMenuItem
        onSelect={handleLogout}
        className="rounded-lg py-2.5 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{t("logout")}</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/95">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground truncate">
                {t("brand")}
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6 shrink-0">
            <Link href="/#features" className={navLinkClass}>
              {t("features")}
            </Link>
            <Link href="/#how-it-works" className={navLinkClass}>
              {t("howItWorks")}
            </Link>
            <Link href="/build" className={navLinkClass}>
              {t("buildCv")}
            </Link>
            <Link href="/analyze" className={navLinkClass}>
              {t("analyze")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="flex items-center space-x-4 ml-4 justify-end">
              {isLoading ? (
                <div
                  className="rounded-full h-10 w-10 p-0 ring-1 ring-border flex items-center justify-center"
                  aria-hidden
                >
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                </div>
              ) : isSignedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AccountAvatarTrigger avatarUrl={avatarUrl} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-56 rounded-xl border border-border bg-card/95 backdrop-blur-md text-card-foreground shadow-lg p-2"
                  >
                    {accountMenuItems}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login" className={navLinkClass}>
                    {t("signIn")}
                  </Link>
                  <Button size="sm" className="rounded-full px-4" asChild>
                    <Link href="/signup">{t("signUp")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {!isLoading && isSignedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AccountAvatarTrigger avatarUrl={avatarUrl} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl border border-border bg-card/95 backdrop-blur-md text-card-foreground shadow-lg p-2 z-[80]"
                >
                  {accountMenuItems}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu (rendered outside <nav> to avoid z-index stacking context issues) */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            aria-hidden="true"
            onClick={closeMobile}
          />

          {/* Panel */}
          <div
            id="mobile-nav-panel"
            className="fixed top-0 right-0 z-[70] h-full w-[min(85%,20rem)] border-l border-border bg-background shadow-xl flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={t("brand")}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={closeMobile}
              >
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  {t("brand")}
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={closeMobile}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Panel nav links */}
            <div className="flex flex-col px-4 pt-2">
              <Link
                href="/#features"
                className={mobileNavLinkClass}
                onClick={closeMobile}
              >
                {t("features")}
              </Link>
              <Link
                href="/#how-it-works"
                className={mobileNavLinkClass}
                onClick={closeMobile}
              >
                {t("howItWorks")}
              </Link>
              <Link
                href="/build"
                className={mobileNavLinkClass}
                onClick={closeMobile}
              >
                {t("buildCv")}
              </Link>
              <Link
                href="/analyze"
                className={mobileNavLinkClass}
                onClick={closeMobile}
              >
                {t("analyze")}
              </Link>
            </div>

            {/* Language row */}
            <div className="mx-4 mt-4 flex items-center justify-between gap-2 py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Language</span>
              <LanguageSwitcher />
            </div>

            {/* Auth section at the bottom */}
            <div className="mt-auto px-4 pb-6 pt-4 flex flex-col gap-3">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : isSignedIn ? (
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href="/login" onClick={closeMobile}>
                      {t("signIn")}
                    </Link>
                  </Button>
                  <Button className="w-full rounded-xl" asChild>
                    <Link href="/signup" onClick={closeMobile}>
                      {t("signUp")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
