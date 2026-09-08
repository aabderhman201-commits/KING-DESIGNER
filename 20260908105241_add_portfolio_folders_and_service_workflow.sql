/*
# Add portfolio folders, service covers, and service request workflow

1. New Tables
- `portfolio_folders` — Designer portfolio folders with cover image, name, description, and media items.
  - id (uuid PK)
  - user_id (uuid, defaults to auth.uid(), references profiles)
  - name (text, not null)
  - description (text)
  - cover_url (text) — cover image URL
  - media (jsonb, default '[]') — array of MediaItem objects
  - created_at (timestamptz, default now())

2. Modified Tables
- `designer_services` — add `cover_url` column (text, nullable) for service cover image.
- `service_requests` — add columns:
  - `cover_url` (text, nullable) — cover image for the request
  - `designer_id` (uuid, nullable) — the designer who accepted/rejected the request
  - `reject_reason` (text, nullable) — reason for rejection (anonymous to client)
  - `accepted_at` (timestamptz, nullable) — when designer accepted
  - `rejected_at` (timestamptz, nullable) — when designer rejected

3. Security
- Enable RLS on portfolio_folders.
- 4 owner-scoped CRUD policies on portfolio_folders (TO authenticated).
- Existing policies on designer_services and service_requests remain unchanged (owners can already CRUD their own rows).

4. Notes
- All columns are additive — no data loss.
- portfolio_folders.media stores MediaItem[] as jsonb, same shape as posts.media.
- service_requests.designer_id is set when a designer accepts; the notification system uses it to route accept/reject notifications.
*/

-- Create portfolio_folders table
CREATE TABLE IF NOT EXISTS portfolio_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  cover_url text,
  media jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_portfolio_folders" ON portfolio_folders;
CREATE POLICY "select_portfolio_folders" ON portfolio_folders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_portfolio_folders" ON portfolio_folders;
CREATE POLICY "insert_own_portfolio_folders" ON portfolio_folders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_portfolio_folders" ON portfolio_folders;
CREATE POLICY "update_own_portfolio_folders" ON portfolio_folders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_portfolio_folders" ON portfolio_folders;
CREATE POLICY "delete_own_portfolio_folders" ON portfolio_folders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Add cover_url to designer_services
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designer_services' AND column_name = 'cover_url') THEN
    ALTER TABLE designer_services ADD COLUMN cover_url text;
  END IF;
END $$;

-- Add cover_url, designer_id, reject_reason, accepted_at, rejected_at to service_requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'cover_url') THEN
    ALTER TABLE service_requests ADD COLUMN cover_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'designer_id') THEN
    ALTER TABLE service_requests ADD COLUMN designer_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'reject_reason') THEN
    ALTER TABLE service_requests ADD COLUMN reject_reason text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'accepted_at') THEN
    ALTER TABLE service_requests ADD COLUMN accepted_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'rejected_at') THEN
    ALTER TABLE service_requests ADD COLUMN rejected_at timestamptz;
  END IF;
END $$;

-- Allow designers to update service_requests they accepted (for accept/reject)
DROP POLICY IF EXISTS "update_accepted_service_requests" ON service_requests;
CREATE POLICY "update_accepted_service_requests" ON service_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR auth.uid() = designer_id) WITH CHECK (auth.uid() = user_id OR auth.uid() = designer_id);
