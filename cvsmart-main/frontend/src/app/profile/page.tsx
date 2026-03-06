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
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  AlertCircle,
  Check,
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
import { useToast } from "@/hooks/use-toast";

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

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
        toast({
          title: "Error loading profile",
          description:
            "There was a problem loading your profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [supabase, toast]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

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

      setMessage("Profile updated successfully");
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      toast({
        title: "Update failed",
        description:
          err.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
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
          onUploadProgress: (progress) => {
            const percent = Math.round(
              (progress.loaded / progress.total) * 100
            );
            setUploadProgress(percent);
          },
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
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "There was a problem uploading your image.",
        variant: "destructive",
      });
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
      toast({
        title: "Image deleted",
        description: "Your profile image has been removed.",
      });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "There was a problem deleting your image.",
        variant: "destructive",
      });
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
        <div className="min-h-screen bg-black">
          <div className="container mx-auto py-10 px-4 md:px-6">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-600 rounded-full filter blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-cyan-600 rounded-full filter blur-[150px] opacity-20 animate-pulse"></div>

        <div className="container mx-auto py-10 px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h1 className="text-4xl font-bold  text-white bg-clip-text">
              My Profile
            </h1>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="mt-4 md:mt-0 group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white transition-all duration-300 rounded-xl"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-4 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white transition-all duration-300 rounded-xl"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert className="mb-6 bg-white/10 backdrop-blur-sm border border-red-500/20 text-red-400 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-6 bg-white/10 backdrop-blur-sm border border-green-500/20 text-green-400 rounded-xl">
              <Check className="h-4 w-4 text-green-400" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Profile summary */}
            <div className="space-y-8">
              <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Image Section */}
                    <div className="relative mb-6">
                      <Avatar className="h-36 w-36 border-4 border-white/20 rounded-full">
                        {profile.avatar_url ? (
                          <AvatarImage
                            src={profile.avatar_url || "/placeholder.svg"}
                            alt={profile.full_name || "Profile"}
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="text-3xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full">
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
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl"
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
                                className="bg-red-600/80 hover:bg-red-600 text-white rounded-xl"
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
                                className="h-2 bg-white/20"
                              />
                              <p className="text-xs text-center mt-2 text-white/70">
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
                          <Label htmlFor="full_name" className="text-white/80">
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
                            className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="title" className="text-white/80">
                            Professional Title
                          </Label>
                          <Input
                            id="title"
                            value={profile.title || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, title: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-white/80">
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
                            className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-white">
                          {profile.full_name}
                        </h2>
                        <p className="text-white/70 mt-2">{profile.title}</p>
                        <div className="flex items-center mt-3 text-sm text-white/60">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{profile.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>

                <Separator className="bg-white/20" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-white">
                    Profile Completeness
                  </h3>
                  <Progress value={completeness} className="h-2 bg-white/20" />
                  <p className="text-sm text-white/60 mt-2">
                    {completeness}% complete
                  </p>
                </CardContent>

                <Separator className="bg-white/20" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-white">
                    Contact Information
                  </h3>

                  {editMode ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="email" className="text-white/80">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user?.email}
                          disabled
                          className="bg-white/5 border-white/10 text-white/70 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white/80">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={profile.phone || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          placeholder="Your phone number"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-white/80">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={profile.website || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, website: e.target.value })
                          }
                          placeholder="https://yourwebsite.com"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-white">
                        <span className="font-medium text-white/80">
                          Email:
                        </span>{" "}
                        {user?.email}
                      </p>
                      {profile.phone && (
                        <p className="text-sm text-white">
                          <span className="font-medium text-white/80">
                            Phone:
                          </span>{" "}
                          {profile.phone}
                        </p>
                      )}
                      {profile.website && (
                        <p className="text-sm flex items-center text-white">
                          <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            {profile.website.replace(/^https?:\/\//, "")}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>

                <Separator className="bg-white/20" />

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-white">
                    Social Profiles
                  </h3>

                  {editMode ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="linkedin" className="text-white/80">
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={profile.linkedin || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, linkedin: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/username"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github" className="text-white/80">
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={profile.github || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, github: e.target.value })
                          }
                          placeholder="https://github.com/username"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter" className="text-white/80">
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={profile.twitter || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, twitter: e.target.value })
                          }
                          placeholder="https://twitter.com/username"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
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
                          className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                        </a>
                      ) : null}

                      {profile.github ? (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Github className="h-4 w-4 mr-2" /> GitHub
                        </a>
                      ) : null}

                      {profile.twitter ? (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Twitter className="h-4 w-4 mr-2" /> Twitter
                        </a>
                      ) : null}

                      {!profile.linkedin &&
                        !profile.github &&
                        !profile.twitter &&
                        !editMode && (
                          <p className="text-sm text-white/60">
                            No social profiles added yet
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div>
                      <Label htmlFor="skills" className="text-white/80">
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
                        className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {(profile.skills || []).map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl px-3 py-1"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {(!profile.skills || profile.skills.length === 0) && (
                        <p className="text-sm text-white/60">
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
              <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div>
                      <Label htmlFor="bio" className="text-white/80">
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        placeholder="Write a short bio about yourself..."
                        className="min-h-[150px] bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      />
                    </div>
                  ) : (
                    <p className="text-white/70">
                      {profile.bio || "No bio added yet"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="experience" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                  <TabsTrigger
                    value="experience"
                    className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                  >
                    Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                  >
                    Education
                  </TabsTrigger>
                  <TabsTrigger
                    value="resumes"
                    className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
                  >
                    Resumes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="experience">
                  <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Briefcase className="mr-2 h-5 w-5 text-cyan-400" />{" "}
                        Work Experience
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Your professional experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <div className="space-y-8">
                          {(profile.experience || []).map((exp, index) => (
                            <div
                              key={index}
                              className="space-y-6 pb-6 border-b border-white/20 last:border-0"
                            >
                              <div>
                                <Label className="text-white/80">
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-white/80">Company</Label>
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-white/80">
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-white/80">
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <Button
                                variants="destructive"
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
                                className="bg-red-600/80 hover:bg-red-600 text-white rounded-xl"
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
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl"
                          >
                            Add Experience
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {(profile.experience || []).map((exp, index) => (
                            <div
                              key={index}
                              className="pb-6 border-b border-white/20 last:border-0"
                            >
                              <h3 className="font-semibold text-lg text-white">
                                {exp.position}
                              </h3>
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-white/70">{exp.company}</p>
                                <p className="text-sm text-white/60">
                                  {exp.duration}
                                </p>
                              </div>
                              <p className="text-sm text-white/70">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                          {(!profile.experience ||
                            profile.experience.length === 0) && (
                            <p className="text-sm text-white/60">
                              No experience added yet
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education">
                  <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <GraduationCap className="mr-2 h-5 w-5 text-cyan-400" />{" "}
                        Education
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Your educational background
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <div className="space-y-8">
                          {(profile.education || []).map((edu, index) => (
                            <div
                              key={index}
                              className="space-y-6 pb-6 border-b border-white/20 last:border-0"
                            >
                              <div>
                                <Label className="text-white/80">Degree</Label>
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-white/80">
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-white/80">Year</Label>
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
                                  className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
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
                                className="bg-red-600/80 hover:bg-red-600 text-white rounded-xl"
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
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl"
                          >
                            Add Education
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {(profile.education || []).map((edu, index) => (
                            <div
                              key={index}
                              className="pb-6 border-b border-white/20 last:border-0"
                            >
                              <h3 className="font-semibold text-lg text-white">
                                {edu.degree}
                              </h3>
                              <div className="flex justify-between items-center">
                                <p className="text-white/70">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-white/60">
                                  {edu.year}
                                </p>
                              </div>
                            </div>
                          ))}
                          {(!profile.education ||
                            profile.education.length === 0) && (
                            <p className="text-sm text-white/60">
                              No education added yet
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resumes">
                  <Card className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white">My Resumes</CardTitle>
                      <CardDescription className="text-white/60">
                        Manage your uploaded resumes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-10 border border-white/20 rounded-xl">
                        <p className="text-white/60 mb-6">
                          No resumes uploaded yet
                        </p>
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white transition-all duration-300 rounded-xl">
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
