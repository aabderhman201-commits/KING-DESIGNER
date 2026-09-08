-- Fix: Allow designers to update open service requests to accept them.
-- The previous policy required auth.uid() = designer_id, but designer_id is NULL 
-- when the request is still open, so designers couldn't accept.
-- Drop the old policy and create a new one that allows:
-- 1. The original user (owner) to update their own requests
-- 2. Admins to update any request
-- 3. Any authenticated designer to update an open request (status = 'open') 
--    so they can accept it by setting designer_id and status = 'taken'

DROP POLICY IF EXISTS "update_accepted_service_requests" ON service_requests;
DROP POLICY IF EXISTS "service_requests_update_own" ON service_requests;

CREATE POLICY "service_requests_update" ON service_requests FOR UPDATE
  TO authenticated 
  USING (
    auth.uid() = user_id 
    OR is_admin()
    OR (status = 'open' AND designer_id IS NULL)
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR is_admin()
    OR auth.uid() = designer_id
  );
