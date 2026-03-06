import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="app-page min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-2 text-sm max-w-sm">
              {subtitle}
            </p>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border text-xs text-muted-foreground mt-3">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
            Secure Authentication
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          {children}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          CVSmart © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
