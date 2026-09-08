/*
# Add splash screens, message requests, and avatar frame support

1. New Tables
- `splash_screens` — 3 splash screens that admins can configure, enable/disable, and assign. Each has an image URL, title, subtitle, order, enabled flag, and duration.
- `message_requests` — Messages from non-friends go here as "unimportant" content. Fields: id, conversation_id, sender_id, content, media, voice_url, status (pending/accepted/rejected), created_at.

2. Modified Tables
- `profiles` — add `avatar_frame_url` (text, nullable) for custom WEBP avatar frames assigned by admin. Add `avatar_gif_url` (text, nullable) for GIF avatars available from VIP3+.

3. Security
- Enable RLS on both new tables.
- `splash_screens`: readable by all (anon+authenticated), writable only by admin.
- `message_requests`: users can read/insert/update their own requests.
- `profiles` already has RLS enabled; new columns inherit existing policies.

4. Notes
- Avatar frames are WEBP images uploaded by admin, overlaid on user avatars.
- GIF avatars are only available for VIP level 3 and above.
- Splash screens show for 5 seconds with a countdown and skip button.
*/

-- Add avatar frame and gif columns to profiles
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_frame_url text;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_gif_url text;
END $$;

-- Create splash_screens table
CREATE TABLE IF NOT EXISTS splash_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL DEFAULT '',
  subtitle text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  duration_seconds integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE splash_screens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "splash_select_all" ON splash_screens;
CREATE POLICY "splash_select_all" ON splash_screens FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "splash_insert_admin" ON splash_screens;
CREATE POLICY "splash_insert_admin" ON splash_screens FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "splash_update_admin" ON splash_screens;
CREATE POLICY "splash_update_admin" ON splash_screens FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "splash_delete_admin" ON splash_screens;
CREATE POLICY "splash_delete_admin" ON splash_screens FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Create message_requests table
CREATE TABLE IF NOT EXISTS message_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  voice_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_req_select_own" ON message_requests;
CREATE POLICY "msg_req_select_own" ON message_requests FOR SELECT
  TO authenticated USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "msg_req_insert_own" ON message_requests;
CREATE POLICY "msg_req_insert_own" ON message_requests FOR INSERT
  TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "msg_req_update_own" ON message_requests;
CREATE POLICY "msg_req_update_own" ON message_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_message_requests_conversation ON message_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_splash_screens_order ON splash_screens(display_order);
