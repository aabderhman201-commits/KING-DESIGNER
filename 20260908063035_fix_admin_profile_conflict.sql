-- Fix: The admin profile row has a hardcoded UUID (00000000-0000-0000-0000-000000000010)
-- that doesn't match any real auth user. When the Auth API creates the admin user,
-- it gets a random UUID. The trigger tries to insert king_id=10000 but that's already
-- taken by the orphaned profile row, causing a unique violation that fails signup.
--
-- Solution: Delete the orphaned admin profile row and let the trigger create a fresh one.

DELETE FROM profiles WHERE king_id = 10000;

-- Also update the trigger to use nextval for admin too (avoids unique conflict),
-- then we'll set king_id=10000 after the user is created.
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
