"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black px-4">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-full p-6 shadow-lg">
            <Loader2 className="animate-spin h-8 w-8 text-cyan-400" />
          </div>
          <p className="text-sm text-white/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
