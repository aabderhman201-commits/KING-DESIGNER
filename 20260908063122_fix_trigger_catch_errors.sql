-- Make the trigger more robust by catching any exception
-- This way if the profile insert fails, the user creation still succeeds
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    -- The profile can be created later
    RAISE NOTICE 'Profile creation failed for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$;
