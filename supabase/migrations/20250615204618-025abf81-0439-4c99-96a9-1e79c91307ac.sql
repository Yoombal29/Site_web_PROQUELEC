
-- Ajoute les colonnes pour l'extrait, le slug (pour l'URL) et l'image de couverture
ALTER TABLE public.blog_posts
ADD COLUMN excerpt TEXT,
ADD COLUMN slug TEXT,
ADD COLUMN cover_image_url TEXT;

-- Ajoute une contrainte pour s'assurer que chaque slug est unique.
-- Important pour avoir des URLs uniques par article.
ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);

-- Politique permettant aux auteurs de supprimer leurs propres articles
CREATE POLICY "Auteurs peuvent supprimer leurs articles"
  ON public.blog_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Politique générale permettant aux administrateurs de gérer tous les aspects des articles.
CREATE POLICY "Les administrateurs ont tous les droits sur les articles"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
