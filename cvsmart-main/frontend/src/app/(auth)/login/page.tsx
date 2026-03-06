"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/auth/auth-layout";

export default function LoginPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const errorDescription = hashParams.get("error_description");
      if (errorDescription) {
        toast.error(decodeURIComponent(errorDescription));
      }
    }
  }, []);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      toast.success(decodeURIComponent(message));
    }
  }, [searchParams]);

  return (
    <AuthLayout title="Sign in" subtitle="Enter your credentials to access your account">
      <LoginForm />
    </AuthLayout>
  );
}
