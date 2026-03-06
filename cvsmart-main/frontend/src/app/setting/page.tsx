/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle, Check } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full filter blur-[150px] opacity-30 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-full filter blur-[150px] opacity-30 animate-[pulse_10s_ease-in-out_infinite]"></div>

        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl font-bold text-white bg-clip-text">
            Account Settings
          </h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid grid-cols-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-1">
              <TabsTrigger
                value="profile"
                className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-cyan-500"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-cyan-500"
              >
                Password
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="text-white/80 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300 focus:ring-2 focus:ring-cyan-500"
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Fetch user data on component mount
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          // You would typically fetch the user's profile from your database here
          // For now, we'll just use the email
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
    setError(null);
    setMessage(null);

    try {
      // Here you would typically update the user's profile in your database
      // For this example, we'll just show a success message

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all duration-300 animate-[fadeIn_0.8s_ease-out] hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-lg">
          Profile Information
        </CardTitle>
        <CardDescription className="text-white/70">
          Update your account profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {error && (
            <Alert className="bg-white/5 backdrop-blur-lg border border-red-500/30 text-red-300 rounded-xl animate-[fadeIn_0.5s_ease-out]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-300 rounded-xl animate-[fadeIn_0.5s_ease-out]">
              <Check className="h-4 w-4 text-green-300" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-white/5 border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="bg-white/5 border-white/10 text-white/70 rounded-xl"
            />
            <p className="text-sm text-white/70">
              To change your email, please contact support.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-cyan-500/50"
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update password");
        console.error(err);
      } else {
        setError("Failed to update password");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

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

      if (error) {
        throw error;
      }

      setMessage("Password reset link sent to your email");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to send reset password link");
        console.error(err);
      } else {
        setError("Failed to send reset password link");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all duration-300 animate-[fadeIn_0.8s_ease-out] hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-lg">Password</CardTitle>
        <CardDescription className="text-white/70">
          Update your password or send a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          {error && (
            <Alert className="bg-white/5 backdrop-blur-lg border border-red-500/30 text-red-300 rounded-xl animate-[fadeIn_0.5s_ease-out]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-300 rounded-xl animate-[fadeIn_0.5s_ease-out]">
              <Check className="h-4 w-4 text-green-300" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white/90">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white/90">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white/90">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-cyan-500/50"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">
            Reset Password
          </h3>
          <p className="text-sm text-white/70 mb-4">
            If you've forgotten your current password, we can send you a
            password reset link.
          </p>
          <Button
            variant="outline"
            onClick={handleResetPassword}
            disabled={loading}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors rounded-xl focus:ring-4 focus:ring-white/30"
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
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveNotifications = async () => {
    setLoading(true);
    setMessage(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessage("Notification preferences saved");
    setLoading(false);
  };

  return (
    <Card className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all duration-300 animate-[fadeIn_0.8s_ease-out] hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white text-lg">
          Notification Settings
        </CardTitle>
        <CardDescription className="text-white/70">
          Manage how we contact you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert className="bg-white/5 backdrop-blur-lg border border-green-500/30 text-green-300 rounded-xl animate-[fadeIn_0.5s_ease-out]">
            <Check className="h-4 w-4 text-green-300" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Email Notifications</h3>
              <p className="text-sm text-white/70">
                Receive emails about your account activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Marketing Emails</h3>
              <p className="text-sm text-white/70">
                Receive emails about new features and promotions
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveNotifications}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-cyan-500/50"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
