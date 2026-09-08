-- Fix 1: Recreate handle_new_user with explicit search_path (required by newer Supabase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix 2: Ensure the admin auth user exists with correct password
-- The original migration used crypt() but the row may not have been inserted
-- or the password may not match. We re-insert if missing, or update the password.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kingdesign.com') THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      role, aud, instance_id
    )
    VALUES (
      '00000000-0000-0000-0000-000000000010',
      'admin@kingdesign.com',
      crypt('Admin123456!', gen_salt('bf')),
      now(), now(), now(),
      '{"is_admin": true}'::jsonb,
      '{"is_admin": true}'::jsonb,
      'authenticated',
      'authenticated',
      '00000000-0000-0000-0000-000000000000'
    );
  ELSE
    -- Update the password to make sure it's correct
    UPDATE auth.users
    SET encrypted_password = crypt('Admin123456!', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    WHERE email = 'admin@kingdesign.com';
  END IF;
END $$;

-- Fix 3: Make sure admin profile is linked to the correct auth user id
UPDATE profiles
SET email = 'admin@kingdesign.com',
    is_admin = true,
    display_name = 'King Design Admin'
WHERE king_id = 10000;
