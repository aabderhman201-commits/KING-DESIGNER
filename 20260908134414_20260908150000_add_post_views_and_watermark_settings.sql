/*
# Add post view counts and editable download watermark

1. New columns
- `posts.view_count`: number of feed views for each post, starting at zero.

2. New tables
- `site_settings`: shared site configuration.
- `site_settings.key`: unique setting name.
- `site_settings.value`: JSON value for the setting.
- `site_settings.updated_by`: administrator who last changed it.

3. Security
- Authenticated users may read site settings so the watermark can be displayed.
- Only administrators may insert, update, or delete site settings.
- Existing post ownership and visibility rules remain unchanged.

4. Important notes
- Existing posts keep their data and receive a zero view count.
- The watermark setting is optional; the application can use its current logo when no custom value exists.
*/

ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_authenticated" ON site_settings;
CREATE POLICY "site_settings_select_authenticated" ON site_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON site_settings;
CREATE POLICY "site_settings_insert_admin" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "site_settings_update_admin" ON site_settings;
CREATE POLICY "site_settings_update_admin" ON site_settings FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "site_settings_delete_admin" ON site_settings;
CREATE POLICY "site_settings_delete_admin" ON site_settings FOR DELETE
  TO authenticated USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);