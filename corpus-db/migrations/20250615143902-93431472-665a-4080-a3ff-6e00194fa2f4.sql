
-- PHASE 1: Critical RLS fixes

-- 1. USER_ROLES table: add RLS policies

-- Policy: Users can read their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can view all roles (using security definer fn)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can INSERT roles
CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can UPDATE roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can DELETE roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. BLOG_CATEGORIES table: enable RLS and add policies

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read blog categories
CREATE POLICY "Everyone can read blog categories"
  ON public.blog_categories
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert blog categories
CREATE POLICY "Admins can add blog categories"
  ON public.blog_categories
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can update blog categories
CREATE POLICY "Admins can update blog categories"
  ON public.blog_categories
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete blog categories
CREATE POLICY "Admins can delete blog categories"
  ON public.blog_categories
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
