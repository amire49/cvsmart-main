"use client";

import { useEffect, useState } from "react";
import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/components/auth/auth-layout";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in the URL hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorDescription = hashParams.get("error_description");

      if (errorDescription) {
        setError(decodeURIComponent(errorDescription));
      }
    }
  }, []);

  return (
    <AuthLayout title="Login to your account">
      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </AuthLayout>
  );
}
