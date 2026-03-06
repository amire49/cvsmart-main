"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "../ui/button";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";

const inputClass =
  "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-xl h-11";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("We sent you a password reset link.");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-foreground">
          Email
        </Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full h-11 font-medium"
      >
        {loading ? "Sending link…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
