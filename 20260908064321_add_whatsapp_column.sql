-- Add optional WhatsApp number column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;
