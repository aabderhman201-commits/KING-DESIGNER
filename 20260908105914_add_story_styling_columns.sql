-- Add story styling columns: background, font, text_color, text_overlay
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'background') THEN
    ALTER TABLE stories ADD COLUMN background text DEFAULT 'default';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'font_family') THEN
    ALTER TABLE stories ADD COLUMN font_family text DEFAULT 'display';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'text_color') THEN
    ALTER TABLE stories ADD COLUMN text_color text DEFAULT '#ffffff';
  END IF;
END $$;
