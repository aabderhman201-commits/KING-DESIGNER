/*
# Add report video URL, name gradient, and avatar frames management

## Changes

### 1. reports table - add video_url column
- Adds `video_url` column to the `reports` table so report submissions can store an attached video (max 1 minute).
- The column is nullable since not all reports include video.

### 2. profiles table - add name_gradient column
- Adds `name_gradient` (text, nullable) to `profiles` so users can have multi-color gradient names instead of just a single `pro_color`.
- Stored as a JSON array of hex color strings, e.g. `["#ff0000","#0000ff"]`.

### 3. avatar_frames table (new)
- Stores avatar frame assets that admins can manage (activate, deactivate, replace).
- Columns: id, name, frame_url, is_active, created_at, updated_at.
- Admin-only write access; all authenticated users can read.

### 4. Security
- avatar_frames: RLS enabled. SELECT for all authenticated (so the app can display frames). INSERT/UPDATE/DELETE admin-only via `is_admin()` function.
- No changes to existing RLS policies on reports or profiles.
*/

-- 1. Add video_url to reports
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'video_url') THEN
    ALTER TABLE reports ADD COLUMN video_url text;
  END IF;
END $$;

-- 2. Add name_gradient to profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name_gradient') THEN
    ALTER TABLE profiles ADD COLUMN name_gradient text;
  END IF;
END $$;

-- 3. Create avatar_frames table
CREATE TABLE IF NOT EXISTS avatar_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  frame_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE avatar_frames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avatar_frames_select" ON avatar_frames;
CREATE POLICY "avatar_frames_select" ON avatar_frames FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "avatar_frames_insert_admin" ON avatar_frames;
CREATE POLICY "avatar_frames_insert_admin" ON avatar_frames FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "avatar_frames_update_admin" ON avatar_frames;
CREATE POLICY "avatar_frames_update_admin" ON avatar_frames FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "avatar_frames_delete_admin" ON avatar_frames;
CREATE POLICY "avatar_frames_delete_admin" ON avatar_frames FOR DELETE
  TO authenticated USING (is_admin());
