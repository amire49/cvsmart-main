"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "../ui/button";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { PasswordInput } from "../ui/password-input";

const inputClass =
  "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring rounded-xl h-11";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("We sent you a confirmation link.");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground">
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground">
          Password
        </Label>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm" className="text-foreground">
          Confirm password
        </Label>
        <PasswordInput
          id="signup-confirm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          className={inputClass}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full h-11 font-medium"
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
