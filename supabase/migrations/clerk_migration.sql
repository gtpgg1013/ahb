-- Migration: Supabase Auth to Clerk Auth
-- This migration changes user ID columns from UUID to TEXT to support Clerk's string IDs

-- 1. Drop the trigger that auto-creates profiles on Supabase auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public inspirations are viewable by everyone" ON public.inspirations;
DROP POLICY IF EXISTS "Users can create own inspirations" ON public.inspirations;
DROP POLICY IF EXISTS "Users can update own inspirations" ON public.inspirations;
DROP POLICY IF EXISTS "Users can delete own inspirations" ON public.inspirations;
DROP POLICY IF EXISTS "Users can create own resonates" ON public.resonates;
DROP POLICY IF EXISTS "Users can delete own resonates" ON public.resonates;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- 3. Drop foreign key constraints
ALTER TABLE public.inspirations DROP CONSTRAINT IF EXISTS inspirations_user_id_fkey;
ALTER TABLE public.resonates DROP CONSTRAINT IF EXISTS resonates_user_id_fkey;
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_inspiration_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_comment_id_fkey;

-- 4. Drop the profiles primary key and foreign key to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 5. Change column types from UUID to TEXT
-- First delete existing data (we'll need to create new users via Clerk)
DELETE FROM public.notifications;
DELETE FROM public.comments;
DELETE FROM public.bookmarks;
DELETE FROM public.resonates;
DELETE FROM public.inspirations;
DELETE FROM public.profiles;

-- Now alter columns
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.inspirations ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.resonates ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.comments ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.notifications ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.notifications ALTER COLUMN actor_id TYPE TEXT;

-- 6. Re-add primary key to profiles
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- 7. Re-add foreign key constraints (now with TEXT type)
ALTER TABLE public.inspirations
  ADD CONSTRAINT inspirations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.resonates
  ADD CONSTRAINT resonates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bookmarks
  ADD CONSTRAINT bookmarks_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_inspiration_id_fkey
  FOREIGN KEY (inspiration_id) REFERENCES public.inspirations(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_comment_id_fkey
  FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

-- 8. Disable RLS (we'll use service role key which bypasses RLS anyway)
-- This is simpler than maintaining RLS policies without Supabase Auth
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspirations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Done! The database is now ready for Clerk authentication.
-- User IDs from Clerk (like "user_2abc123") can be stored in TEXT columns.
