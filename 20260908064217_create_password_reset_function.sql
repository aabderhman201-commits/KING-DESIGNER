-- Create a SECURITY DEFINER function to reset admin password
-- This runs with elevated privileges to access auth.users
CREATE OR REPLACE FUNCTION public.reset_admin_password(target_email text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now()
  WHERE email = target_email;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_admin_password(text, text) TO anon, authenticated;
