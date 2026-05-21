
-- Enable RLS on the blog_categories table
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all categories
CREATE POLICY "Allow public read access on blog categories"
ON public.blog_categories
FOR SELECT
USING (true);

-- Allow admins to manage categories
CREATE POLICY "Allow admins to manage blog categories"
ON public.blog_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
