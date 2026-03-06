-- Create profiles table for CVSmart
-- Run this in Supabase Dashboard: SQL Editor → New query → paste and run

-- Table: public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text,
  full_name text DEFAULT '',
  title text DEFAULT 'Professional Title',
  location text DEFAULT 'City, Country',
  bio text DEFAULT '',
  phone text DEFAULT '',
  website text DEFAULT '',
  linkedin text DEFAULT '',
  github text DEFAULT '',
  twitter text DEFAULT '',
  avatar_url text,
  skills jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  experience jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile images: In Supabase Dashboard go to Storage, create a bucket named "profile-images"
-- (public). Add a policy so users can upload/update/delete their own files in that bucket.
