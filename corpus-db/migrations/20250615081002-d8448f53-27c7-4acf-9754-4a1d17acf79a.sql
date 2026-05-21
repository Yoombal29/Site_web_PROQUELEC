
-- Table de profils utilisateurs
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: users can view their profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: users can update their profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Table de catégories de blog
CREATE TABLE public.blog_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Table des articles de blog
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id INT REFERENCES public.blog_categories(id),
  title TEXT NOT NULL,
  content TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog: lecture publique" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Blog: auteurs peuvent ajouter/éditer" ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Blog: auteurs peuvent éditer" ON public.blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- Table des documents techniques à télécharger
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents: lecture publique" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Documents: uploaders peuvent insérer" ON public.documents FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- Table des événements (agenda, formations)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events: lecture publique" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events: organisateurs peuvent ajouter" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Table de demandes de contact ou d'informations
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contacts: lecture réservée à l'équipe (à adapter)" ON public.contact_requests FOR SELECT USING (false);
CREATE POLICY "Contacts: création publique" ON public.contact_requests FOR INSERT WITH CHECK (true);

-- Activation du support temps réel pour blog_posts, documents et events (optionnel)
ALTER TABLE public.blog_posts REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
