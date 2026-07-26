-- ContentHub Sidekick — Run this in Supabase SQL Editor

-- User profiles (account type decides which portal they see)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  account_type TEXT DEFAULT 'creator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator videos (user-scoped — each creator sees only their own)
CREATE TABLE IF NOT EXISTS creator_videos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  platform TEXT DEFAULT 'TikTok',
  stage TEXT DEFAULT 'idea',
  target_date TEXT,
  publish_date TEXT,
  url TEXT DEFAULT '',
  month TEXT,
  hook TEXT DEFAULT '',
  format TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  para_ti NUMERIC,
  siguiendo NUMERIC,
  busqueda NUMERIC,
  pauta NUMERIC DEFAULT 0,
  metrics_added BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly goals per creator
CREATE TABLE IF NOT EXISTS creator_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  goal INTEGER DEFAULT 8,
  UNIQUE(user_id, month)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, account_type)
  VALUES (new.id, new.email, new.email, 'creator')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Disable email confirmations (also do this in Auth > Email settings)
