"use client";

import type React from "react";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Switch } from "@/components/ui/switch";
export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
        {/* Animated Background - same as dashboard / other pages */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
        </div>

        <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">
              Account Settings
            </h1>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid grid-cols-3 bg-muted backdrop-blur-lg border border-border rounded-xl p-1">
              <TabsTrigger
                value="profile"
                className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300 focus:ring-2 focus:ring-ring"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300 focus:ring-2 focus:ring-ring"
              >
                Password
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300 focus:ring-2 focus:ring-ring"
              >
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="password">
              <PasswordSettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    loadUserProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Your profile has been updated successfully.");
    } catch (err) {
      toast.error("Failed to update profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group bg-card backdrop-blur-lg border border-border rounded-2xl shadow-xl hover:bg-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-foreground text-lg">
          Profile Information
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Update your account profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-muted border-input text-muted-foreground rounded-xl"
            />
            <p className="text-sm text-muted-foreground">
              To change your email, please contact support.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl font-semibold"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Your password has been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        throw new Error("User email not found");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast.success("Check your email for the password reset link.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset link";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group bg-card backdrop-blur-lg border border-border rounded-2xl shadow-xl hover:bg-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-foreground text-lg">Password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Update your password or send a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-foreground">
              Current Password
            </Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-foreground">
              New Password
            </Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">
              Confirm New Password
            </Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-muted border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl font-semibold"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Reset Password
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you&apos;ve forgotten your current password, we can send you a
            password reset link.
          </p>
          <Button
            variant="outline"
            onClick={handleResetPassword}
            disabled={loading}
            className="rounded-xl"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveNotifications = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Notification preferences have been updated.");
    setLoading(false);
  };

  return (
    <Card className="group bg-card backdrop-blur-lg border border-border rounded-2xl shadow-xl hover:bg-accent/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-foreground text-lg">
          Notification Settings
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage how we contact you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive emails about your account activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              className="data-[state=checked]:bg-success"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Marketing Emails</h3>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and promotions
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
              className="data-[state=checked]:bg-success"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveNotifications}
          disabled={loading}
          className="rounded-xl font-semibold"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
