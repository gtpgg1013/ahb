-- As Human Being (AHB) Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspirations table (main content)
CREATE TABLE IF NOT EXISTS public.inspirations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  context TEXT, -- 어떤 상황에서 떠올랐는지
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resonates table (공감)
CREATE TABLE IF NOT EXISTS public.resonates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  inspiration_id UUID REFERENCES public.inspirations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, inspiration_id)
);

-- Bookmarks table (저장)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  inspiration_id UUID REFERENCES public.inspirations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, inspiration_id)
);

-- Comments table (댓글)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  inspiration_id UUID REFERENCES public.inspirations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspirations_user_id ON public.inspirations(user_id);
CREATE INDEX IF NOT EXISTS idx_inspirations_created_at ON public.inspirations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspirations_tags ON public.inspirations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resonates_inspiration_id ON public.resonates(inspiration_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_inspiration_id ON public.comments(inspiration_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resonates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Inspirations policies
CREATE POLICY "Public inspirations are viewable by everyone"
  ON public.inspirations FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own inspirations"
  ON public.inspirations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspirations"
  ON public.inspirations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspirations"
  ON public.inspirations FOR DELETE
  USING (auth.uid() = user_id);

-- Resonates policies
CREATE POLICY "Resonates are viewable by everyone"
  ON public.resonates FOR SELECT
  USING (true);

CREATE POLICY "Users can create own resonates"
  ON public.resonates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resonates"
  ON public.resonates FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER inspirations_updated_at
  BEFORE UPDATE ON public.inspirations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
