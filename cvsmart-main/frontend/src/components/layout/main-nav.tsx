"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function MainNav() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const signedIn = !!session;
        setIsSignedIn(signedIn);
        if (session?.user?.email) setUserEmail(session.user.email);
        if (signedIn && session?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setAvatarUrl(profile?.avatar_url ?? null);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsSignedIn(false);
      setUserEmail(null);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="relative z-10 border-b border-border backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">

          <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            CVSmart
          </span>
        </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 p-0 ring-1 ring-border hover:ring-accent focus-visible:ring-ring"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-9 w-9 rounded-full border-2 border-transparent">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt="Profile"
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-accent text-accent-foreground rounded-full text-sm font-medium">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl border border-border bg-card/95 backdrop-blur-md text-card-foreground shadow-lg p-2"
                >
                  {userEmail && (
                    <>
                      <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground truncate">
                        {userEmail}
                      </div>
                      <DropdownMenuSeparator className="bg-border my-1" />
                    </>
                  )}
                  <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer focus:bg-accent">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 shrink-0" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer focus:bg-accent">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg py-2.5 cursor-pointer focus:bg-accent">
                    <Link href="/setting" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 shrink-0" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg py-2.5 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Button size="sm" className="rounded-full px-4" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
