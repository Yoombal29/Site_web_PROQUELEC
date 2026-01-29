-- Migration: Allow first user to be promoted to admin and disable RLS for first admin creation

-- 1. Create a function to promote the first user as admin (security definer)
CREATE OR REPLACE FUNCTION public.promote_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _admin_count int;
BEGIN
  -- Get current user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if any admin exists
  SELECT COUNT(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- If no admin exists, promote current user
  IF _admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 2. Update RLS policy to allow inserting when it's the first admin
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create new policy that allows:
-- 1. Admins to insert roles (as before)
-- 2. First user to insert their own admin role
CREATE POLICY "Users can manage roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin') OR
    (user_id = auth.uid() AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE role = 'admin'
    ))
  );

-- 3. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.promote_first_admin() TO authenticated;
