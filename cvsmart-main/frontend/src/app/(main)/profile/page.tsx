/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/protected-route";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
// Define the Profile type
type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  location: string;
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  avatar_url: string | null;
  skills: string[];
  education: Education[];
  experience: Experience[];
  created_at: string;
  updated_at: string;
};

type Education = {
  degree: string;
  institution: string;
  year: string;
};

type Experience = {
  position: string;
  company: string;
  duration: string;
  description: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: "",
    title: "",
    location: "",
    bio: "",
    phone: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
    avatar_url: null,
    skills: [],
    education: [],
    experience: [],
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          setUser(user);
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            if (profileError.code === "PGRST205") {
              toast.error(
                "Profile table is missing. Run the SQL in supabase/migrations/001_create_profiles.sql in your Supabase SQL Editor, then refresh."
              );
              setProfile({
                full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
                title: "Professional Title",
                location: "City, Country",
                bio: "Tell us about yourself...",
                avatar_url: null,
                skills: [],
                education: [],
                experience: [],
              });
              return;
            }
            throw profileError;
          }

          if (profileData) {
            setProfile({
              ...profileData,
              skills: profileData.skills || [],
              education: profileData.education || [],
              experience: profileData.experience || [],
            });
          } else {
            const newProfile = {
              user_id: user.id,
              full_name:
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "",
              email: user.email,
              title: "Professional Title",
              location: "City, Country",
              bio: "Tell us about yourself...",
              avatar_url: null,
              skills: [],
              education: [],
              experience: [],
            };

            const { data: insertedProfile, error: insertError } = await supabase
              .from("profiles")
              .insert(newProfile)
              .select()
              .single();

            if (insertError) throw insertError;
            if (insertedProfile) setProfile(insertedProfile);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        toast.error("There was a problem loading your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [supabase]);

  const handleSaveProfile = async () => {
    setLoading(true);

    try {
      if (!user) throw new Error("User not found");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          title: profile.title,
          location: profile.location,
          bio: profile.bio,
          phone: profile.phone,
          website: profile.website,
          linkedin: profile.linkedin,
          github: profile.github,
          twitter: profile.twitter,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setEditMode(false);
      toast.success("Your profile has been updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "There was a problem updating your profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Your profile image has been updated successfully.");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "There was a problem uploading your image. Check that the profile-images bucket exists and you have permission.";
      toast.error(message);
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!user || !profile.avatar_url) return;

    try {
      setUploading(true);
      const url = new URL(profile.avatar_url);
      const filePath = url.pathname.split("/").slice(-2).join("/");
      const { error: deleteError } = await supabase.storage
        .from("profile-images")
        .remove([filePath]);

      if (deleteError) throw deleteError;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: null });
      toast.success("Your profile image has been removed.");
    } catch (err: any) {
      toast.error(err.message || "There was a problem deleting your image.");
      console.error("Error deleting image:", err);
    } finally {
      setUploading(false);
    }
  };

  const calculateProfileCompleteness = () => {
    let total = 0;
    let completed = 0;
    const basicFields = ["full_name", "title", "location", "bio", "phone"];
    total += basicFields.length;
    completed += basicFields.filter((field) =>
      profile[field as keyof typeof profile]?.toString().trim()
    ).length;
    const socialFields = ["website", "linkedin", "github", "twitter"];
    total += socialFields.length;
    completed += socialFields.filter((field) =>
      profile[field as keyof typeof profile]?.toString().trim()
    ).length;
    total += 1;
    if (profile.avatar_url) completed += 1;
    if (profile.skills && profile.skills.length > 0) completed += 1;
    if (profile.education && profile.education.length > 0) completed += 1;
    if (profile.experience && profile.experience.length > 0) completed += 1;
    total += 3;
    return Math.round((completed / total) * 100);
  };

  const completeness = calculateProfileCompleteness();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="app-page min-h-screen bg-background relative overflow-hidden">
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
          </div>
          <div className="container mx-auto py-10 px-4 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <div className="flex gap-3 mt-4 md:mt-0">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-8">
                <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-8">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-36 w-36 rounded-full mb-6" />
                    <Skeleton className="h-6 w-40 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-28 rounded-lg mb-6" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
                <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
                  <Skeleton className="h-5 w-32 rounded-lg mb-4" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
                  <Skeleton className="h-6 w-48 rounded-lg mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
                <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
                  <Skeleton className="h-6 w-36 rounded-lg mb-4" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-page min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background - same as home page */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
        </div>

        <div className="container mx-auto py-10 px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
            <h1 className="text-4xl font-bold text-foreground">
              My Profile
            </h1>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="mt-4 md:mt-0 rounded-xl"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Profile summary */}
            <div className="space-y-8">
              <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Image Section */}
                    <div className="relative mb-6">
                      <Avatar className="h-36 w-36 border-4 border-border rounded-full">
                        {profile.avatar_url ? (
                          <AvatarImage
                            src={profile.avatar_url || "/placeholder.svg"}
                            alt={profile.full_name || "Profile"}
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="text-3xl bg-primary text-primary-foreground rounded-full">
                            {profile.full_name?.substring(0, 2).toUpperCase() ||
                              "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      {editMode && (
                        <div className="mt-4 flex flex-col gap-3">
                          <div className="flex justify-center gap-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="bg-muted border-border text-foreground hover:bg-border transition-colors rounded-xl"
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Photo
                                </>
                              )}
                            </Button>

                            {profile.avatar_url && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteImage}
                                disabled={uploading}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            )}
                          </div>

                          {uploading && (
                            <div className="w-full mt-3">
                              <Progress
                                value={uploadProgress}
                                className="h-2 bg-border"
                              />
                              <p className="text-xs text-center mt-2 text-foreground/70">
                                {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {editMode ? (
                      <div className="w-full space-y-6">
                        <div>
                          <Label htmlFor="full_name" className="text-foreground/80">
                            Full Name
                          </Label>
                          <Input
                            id="full_name"
                            value={profile.full_name || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                full_name: e.target.value,
                              })
                            }
                            className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="title" className="text-foreground/80">
                            Professional Title
                          </Label>
                          <Input
                            id="title"
                            value={profile.title || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, title: e.target.value })
                            }
                            className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-foreground/80">
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={profile.location || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                location: e.target.value,
                              })
                            }
                            className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-foreground">
                          {profile.full_name}
                        </h2>
                        <p className="text-foreground/70 mt-2">{profile.title}</p>
                        <div className="flex items-center mt-3 text-sm text-foreground/60">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{profile.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>

                <Separator className="bg-border" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-foreground">
                    Profile Completeness
                  </h3>
                  <Progress value={completeness} className="h-2 bg-border" />
                  <p className="text-sm text-foreground/60 mt-2">
                    {completeness}% complete
                  </p>
                </CardContent>

                <Separator className="bg-border" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-foreground">
                    Contact Information
                  </h3>

                  {editMode ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="email" className="text-foreground/80">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.email}
                          disabled
                          className="bg-muted border-border text-foreground/70 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-foreground/80">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={profile.phone || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          placeholder="Your phone number"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-foreground/80">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={profile.website || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, website: e.target.value })
                          }
                          placeholder="https://yourwebsite.com"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-foreground/80">
                          Email:
                        </span>{" "}
                        {user?.email}
                      </p>
                      {profile.phone && (
                        <p className="text-sm text-foreground">
                          <span className="font-medium text-foreground/80">
                            Phone:
                          </span>{" "}
                          {profile.phone}
                        </p>
                      )}
                      {profile.website && (
                        <p className="text-sm flex items-center text-foreground">
                          <Globe className="h-4 w-4 mr-2 text-success" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success hover:text-success/90 transition-colors"
                          >
                            {profile.website.replace(/^https?:\/\//, "")}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>

                <Separator className="bg-border" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-foreground">
                    Social Profiles
                  </h3>

                  {editMode ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="linkedin" className="text-foreground/80">
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={profile.linkedin || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, linkedin: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/username"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github" className="text-foreground/80">
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={profile.github || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, github: e.target.value })
                          }
                          placeholder="https://github.com/username"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="text-foreground/80">
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={profile.twitter || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, twitter: e.target.value })
                          }
                          placeholder="https://twitter.com/username"
                          className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      {profile.linkedin ? (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-success hover:text-success/90 transition-colors"
                        >
                          <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                        </a>
                      ) : null}

                      {profile.github ? (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-success hover:text-success/90 transition-colors"
                        >
                          <Github className="h-4 w-4 mr-2" /> GitHub
                        </a>
                      ) : null}

                      {profile.twitter ? (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-success hover:text-success/90 transition-colors"
                        >
                          <Twitter className="h-4 w-4 mr-2" /> Twitter
                        </a>
                      ) : null}

                      {!profile.linkedin &&
                        !profile.github &&
                        !profile.twitter &&
                        !editMode && (
                          <p className="text-sm text-foreground/60">
                            No social profiles added yet
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div>
                      <Label htmlFor="skills" className="text-foreground/80">
                        Skills (comma separated)
                      </Label>
                      <Input
                        id="skills"
                        value={(profile.skills || []).join(", ")}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            skills: e.target.value
                              .split(",")
                              .map((skill) => skill.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="JavaScript, React, Node.js"
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {(profile.skills || []).map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-primary text-primary-foreground rounded-xl px-3 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!profile.skills || profile.skills.length === 0) && (
                        <p className="text-sm text-foreground/60">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Detailed information */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-foreground">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div>
                      <Label htmlFor="bio" className="text-foreground/80">
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        placeholder="Write a short bio about yourself..."
                        className="min-h-[150px] bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                      />
                    </div>
                  ) : (
                    <p className="text-foreground/70">
                      {profile.bio || "No bio added yet"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="experience" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 bg-card backdrop-blur-sm border border-border rounded-xl p-1">
                  <TabsTrigger
                    value="experience"
                    className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
                  >
                    Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
                  >
                    Education
                  </TabsTrigger>
                  <TabsTrigger
                    value="resumes"
                    className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
                  >
                    Resumes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="experience">
                  <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-foreground">
                        <Briefcase className="mr-2 h-5 w-5 text-success" />{" "}
                        Work Experience
                      </CardTitle>
                      <CardDescription className="text-foreground/60">
                        Your professional experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <div className="space-y-8">
                          {(profile.experience || []).map((exp, index) => (
                            <div
                              key={index}
                              className="space-y-6 pb-6 border-b border-border last:border-0"
                            >
                              <div>
                                <Label className="text-foreground/80">
                                  Position
                                </Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => {
                                    const newExp = [
                                      ...(profile.experience || []),
                                    ];
                                    newExp[index].position = e.target.value;
                                    setProfile({
                                      ...profile,
                                      experience: newExp,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-foreground/80">Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => {
                                    const newExp = [
                                      ...(profile.experience || []),
                                    ];
                                    newExp[index].company = e.target.value;
                                    setProfile({
                                      ...profile,
                                      experience: newExp,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-foreground/80">
                                  Duration
                                </Label>
                                <Input
                                  value={exp.duration}
                                  onChange={(e) => {
                                    const newExp = [
                                      ...(profile.experience || []),
                                    ];
                                    newExp[index].duration = e.target.value;
                                    setProfile({
                                      ...profile,
                                      experience: newExp,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-foreground/80">
                                  Description
                                </Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => {
                                    const newExp = [
                                      ...(profile.experience || []),
                                    ];
                                    newExp[index].description = e.target.value;
                                    setProfile({
                                      ...profile,
                                      experience: newExp,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newExp = [
                                    ...(profile.experience || []),
                                  ];
                                  newExp.splice(index, 1);
                                  setProfile({
                                    ...profile,
                                    experience: newExp,
                                  });
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setProfile({
                                ...profile,
                                experience: [
                                  ...(profile.experience || []),
                                  {
                                    position: "",
                                    company: "",
                                    duration: "",
                                    description: "",
                                  },
                                ],
                              });
                            }}
                            className="bg-muted border-border text-foreground hover:bg-border transition-colors rounded-xl"
                          >
                            Add Experience
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {(profile.experience || []).map((exp, index) => (
                            <div
                              key={index}
                              className="pb-6 border-b border-border last:border-0"
                            >
                              <h3 className="font-semibold text-lg text-foreground">
                                {exp.position}
                              </h3>
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-foreground/70">{exp.company}</p>
                                <p className="text-sm text-foreground/60">
                                  {exp.duration}
                                </p>
                              </div>
                              <p className="text-sm text-foreground/70">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                          {(!profile.experience ||
                            profile.experience.length === 0) && (
                            <p className="text-sm text-foreground/60">
                              No experience added yet
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education">
                  <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-foreground">
                        <GraduationCap className="mr-2 h-5 w-5 text-success" />{" "}
                        Education
                      </CardTitle>
                      <CardDescription className="text-foreground/60">
                        Your educational background
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <div className="space-y-8">
                          {(profile.education || []).map((edu, index) => (
                            <div
                              key={index}
                              className="space-y-6 pb-6 border-b border-border last:border-0"
                            >
                              <div>
                                <Label className="text-foreground/80">Degree</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const newEdu = [
                                      ...(profile.education || []),
                                    ];
                                    newEdu[index].degree = e.target.value;
                                    setProfile({
                                      ...profile,
                                      education: newEdu,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-foreground/80">
                                  Institution
                                </Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => {
                                    const newEdu = [
                                      ...(profile.education || []),
                                    ];
                                    newEdu[index].institution = e.target.value;
                                    setProfile({
                                      ...profile,
                                      education: newEdu,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-foreground/80">Year</Label>
                                <Input
                                  value={edu.year}
                                  onChange={(e) => {
                                    const newEdu = [
                                      ...(profile.education || []),
                                    ];
                                    newEdu[index].year = e.target.value;
                                    setProfile({
                                      ...profile,
                                      education: newEdu,
                                    });
                                  }}
                                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newEdu = [...(profile.education || [])];
                                  newEdu.splice(index, 1);
                                  setProfile({ ...profile, education: newEdu });
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setProfile({
                                ...profile,
                                education: [
                                  ...(profile.education || []),
                                  { degree: "", institution: "", year: "" },
                                ],
                              });
                            }}
                            className="bg-muted border-border text-foreground hover:bg-border transition-colors rounded-xl"
                          >
                            Add Education
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {(profile.education || []).map((edu, index) => (
                            <div
                              key={index}
                              className="pb-6 border-b border-border last:border-0"
                            >
                              <h3 className="font-semibold text-lg text-foreground">
                                {edu.degree}
                              </h3>
                              <div className="flex justify-between items-center">
                                <p className="text-foreground/70">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-foreground/60">
                                  {edu.year}
                                </p>
                              </div>
                            </div>
                          ))}
                          {(!profile.education ||
                            profile.education.length === 0) && (
                            <p className="text-sm text-foreground/60">
                              No education added yet
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resumes">
                  <Card className="group bg-card backdrop-blur-sm border border-border rounded-2xl hover:bg-accent/50 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-foreground">My Resumes</CardTitle>
                      <CardDescription className="text-foreground/60">
                        Manage your uploaded resumes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-10 border border-border rounded-xl">
                        <p className="text-foreground/60 mb-6">
                          No resumes uploaded yet
                        </p>
                        <Button className="bg-gradient-to-r  text-foreground transition-all duration-300 rounded-xl">
                          Upload Resume
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
