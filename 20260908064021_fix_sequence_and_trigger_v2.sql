-- Reset the sequence to a clean value and ensure no conflicts
-- The sequence is at 173286 but the only profile has king_id=10000
-- Set the sequence to 10001 so the next user gets 10001
SELECT setval('king_id_seq', 10000, true);

-- Make the trigger function catch exceptions so user creation never fails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO profiles (id, king_id, email)
    VALUES (NEW.id, nextval('king_id_seq'), NEW.email)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile insert skipped for %: %', NEW.email, SQLERRM;
  END;
  RETURN NEW;
END;
$$;
