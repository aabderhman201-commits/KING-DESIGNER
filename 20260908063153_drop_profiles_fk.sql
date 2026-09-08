-- Drop the FK constraint that might be causing issues during user creation
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the trigger without exception handling (simpler, let it work naturally)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@kingdesign.com' THEN
    INSERT INTO profiles (id, king_id, email, is_admin, display_name, account_type)
    VALUES (NEW.id, nextval('king_id_seq'), NEW.email, true, 'King Design Admin', 'client')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO profiles (id, king_id, email)
    VALUES (NEW.id, nextval('king_id_seq'), NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
