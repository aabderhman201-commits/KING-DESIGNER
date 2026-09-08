
/*
# King Design - Core Database Schema

Creates the core schema for the King Design social platform.
Tables: profiles, friendships, posts, stories, comments, likes, story_views,
designer_services, portfolio_sections, ratings.
Admin account: admin@kingdesign.com / Admin123456!
User IDs start at 173285, admin ID is 10000.
*/

-- ============================================
-- SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS king_id_seq START 173285;

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  king_id integer UNIQUE NOT NULL,
  email text NOT NULL,
  account_type text NOT NULL DEFAULT 'client' CHECK (account_type IN ('client', 'designer')),
  display_name text DEFAULT '',
  username text UNIQUE,
  avatar_url text,
  cover_url text,
  bio text DEFAULT '',
  country text,
  age integer,
  is_admin boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  vip_level integer NOT NULL DEFAULT 0 CHECK (vip_level BETWEEN 0 AND 6),
  is_pro boolean NOT NULL DEFAULT false,
  pro_color text DEFAULT '#F59E0B',
  vip_colors jsonb DEFAULT '[]',
  designer_rank integer NOT NULL DEFAULT 0 CHECK (designer_rank BETWEEN 0 AND 10),
  ban_type text CHECK (ban_type IS NULL OR ban_type IN ('permanent', 'temporary', 'photo')),
  ban_until timestamptz,
  is_banned boolean NOT NULL DEFAULT false,
  photo_banned boolean NOT NULL DEFAULT false,
  cv_summary text DEFAULT '',
  cv_experience text DEFAULT '',
  cv_education text DEFAULT '',
  cv_skills text DEFAULT '',
  cv_phone text DEFAULT '',
  cv_location text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILE POLICIES
-- ============================================

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR is_admin()) WITH CHECK (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'admin@kingdesign.com' THEN
    INSERT INTO profiles (id, king_id, email, is_admin, display_name, account_type)
    VALUES (NEW.id, 10000, NEW.email, true, 'King Design Admin', 'client')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO profiles (id, king_id, email)
    VALUES (NEW.id, nextval('king_id_seq'), NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CREATE ADMIN ACCOUNT (using DO block to avoid ON CONFLICT issues with auth.users)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kingdesign.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      '00000000-0000-0000-0000-000000000010',
      'admin@kingdesign.com',
      crypt('Admin123456!', gen_salt('bf')),
      now(), now(), now(),
      '{"is_admin": true}'::jsonb,
      '{"is_admin": true}'::jsonb,
      'authenticated',
      'authenticated'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE king_id = 10000) THEN
    INSERT INTO profiles (id, king_id, email, is_admin, display_name, account_type)
    VALUES ('00000000-0000-0000-0000-000000000010', 10000, 'admin@kingdesign.com', true, 'King Design Admin', 'client');
  END IF;
END $$;

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('media', 'media', true),
  ('messages-media', 'messages-media', true),
  ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth upload avatars" ON storage.objects;
CREATE POLICY "Auth upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
CREATE POLICY "Public read covers" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Auth upload covers" ON storage.objects;
CREATE POLICY "Auth upload covers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
CREATE POLICY "Auth upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth update media" ON storage.objects;
CREATE POLICY "Auth update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Auth delete media" ON storage.objects;
CREATE POLICY "Auth delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Public read messages-media" ON storage.objects;
CREATE POLICY "Public read messages-media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'messages-media');

DROP POLICY IF EXISTS "Auth upload messages-media" ON storage.objects;
CREATE POLICY "Auth upload messages-media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'messages-media');

DROP POLICY IF EXISTS "Auth delete messages-media" ON storage.objects;
CREATE POLICY "Auth delete messages-media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'messages-media');

DROP POLICY IF EXISTS "Owner read verifications" ON storage.objects;
CREATE POLICY "Owner read verifications" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'verifications'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_admin())
  );

DROP POLICY IF EXISTS "Owner upload verifications" ON storage.objects;
CREATE POLICY "Owner upload verifications" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_unique UNIQUE (requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friendships_select" ON friendships;
CREATE POLICY "friendships_select" ON friendships FOR SELECT
  TO authenticated USING (
    requester_id = auth.uid() OR receiver_id = auth.uid() OR is_admin()
  );

DROP POLICY IF EXISTS "friendships_insert_own" ON friendships;
CREATE POLICY "friendships_insert_own" ON friendships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "friendships_update_own" ON friendships;
CREATE POLICY "friendships_update_own" ON friendships FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id OR auth.uid() = requester_id OR is_admin())
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = requester_id OR is_admin());

DROP POLICY IF EXISTS "friendships_delete_own" ON friendships;
CREATE POLICY "friendships_delete_own" ON friendships FOR DELETE
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id OR is_admin());

-- ============================================
-- POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text DEFAULT '',
  media jsonb DEFAULT '[]',
  audience text NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'friends', 'private')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON posts;
CREATE POLICY "posts_select" ON posts FOR SELECT
  TO authenticated USING (
    audience = 'public'
    OR user_id = auth.uid()
    OR (audience = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND friendships.receiver_id = posts.user_id)
        OR (friendships.receiver_id = auth.uid() AND friendships.requester_id = posts.user_id)
      )
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS "posts_insert_own" ON posts;
CREATE POLICY "posts_insert_own" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON posts;
CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON posts;
CREATE POLICY "posts_delete_own" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text DEFAULT '',
  media jsonb DEFAULT '[]',
  audience text NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'friends', 'private')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_select" ON stories;
CREATE POLICY "stories_select" ON stories FOR SELECT
  TO authenticated USING (
    audience = 'public'
    OR user_id = auth.uid()
    OR (audience = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND friendships.receiver_id = stories.user_id)
        OR (friendships.receiver_id = auth.uid() AND friendships.requester_id = stories.user_id)
      )
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS "stories_insert_own" ON stories;
CREATE POLICY "stories_insert_own" ON stories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_delete_own" ON stories;
CREATE POLICY "stories_delete_own" ON stories FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_target_check CHECK (post_id IS NOT NULL OR story_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_story_id ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- LIKES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT likes_target_check CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL),
  CONSTRAINT likes_unique UNIQUE (post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select" ON likes;
CREATE POLICY "likes_select" ON likes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- STORY VIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  reaction text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT story_views_unique UNIQUE (story_id, user_id)
);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "story_views_select" ON story_views;
CREATE POLICY "story_views_select" ON story_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "story_views_insert_own" ON story_views;
CREATE POLICY "story_views_insert_own" ON story_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DESIGNER SERVICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS designer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE designer_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "designer_services_select" ON designer_services;
CREATE POLICY "designer_services_select" ON designer_services FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "designer_services_insert_own" ON designer_services;
CREATE POLICY "designer_services_insert_own" ON designer_services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "designer_services_update_own" ON designer_services;
CREATE POLICY "designer_services_update_own" ON designer_services FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "designer_services_delete_own" ON designer_services;
CREATE POLICY "designer_services_delete_own" ON designer_services FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- PORTFOLIO SECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  post_ids jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_sections_select" ON portfolio_sections;
CREATE POLICY "portfolio_sections_select" ON portfolio_sections FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "portfolio_sections_insert_own" ON portfolio_sections;
CREATE POLICY "portfolio_sections_insert_own" ON portfolio_sections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_sections_update_own" ON portfolio_sections;
CREATE POLICY "portfolio_sections_update_own" ON portfolio_sections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolio_sections_delete_own" ON portfolio_sections;
CREATE POLICY "portfolio_sections_delete_own" ON portfolio_sections FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- RATINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ratings_target_check CHECK (rated_user_id IS NOT NULL OR post_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ratings_rated_user ON ratings(rated_user_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_select" ON ratings;
CREATE POLICY "ratings_select" ON ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "ratings_insert_own" ON ratings;
CREATE POLICY "ratings_insert_own" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "ratings_delete_own" ON ratings;
CREATE POLICY "ratings_delete_own" ON ratings FOR DELETE
  TO authenticated USING (auth.uid() = rater_id);
