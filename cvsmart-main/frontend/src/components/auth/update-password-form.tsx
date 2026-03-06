"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { Loader2 } from "lucide-react";

const inputClass =
  "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-xl h-11";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
      setCheckingSession(false);

      if (!session) {
        toast.error("Please request a new password reset link.");
        router.push("/login");
      }
    };

    checkSession();
  }, [supabase, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Sign in with your new password.");
      router.push("/login");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Checking session…</p>
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <form onSubmit={handleUpdatePassword} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="update-password" className="text-foreground">
          New password
        </Label>
        <Input
          id="update-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="update-confirm" className="text-foreground">
          Confirm new password
        </Label>
        <Input
          id="update-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          className={inputClass}
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-full h-11 font-medium"
        disabled={loading}
      >
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
