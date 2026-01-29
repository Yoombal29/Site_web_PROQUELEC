
-- Créer la table newsletter_subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'website'
);

-- Activer RLS sur newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (inscription newsletter)
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Politique pour que seuls les admins puissent voir les abonnés
CREATE POLICY "Admins can view subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Créer la table analytics_events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (tracking)
CREATE POLICY "Anyone can insert analytics events" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (true);

-- Politique pour que seuls les admins puissent voir les événements
CREATE POLICY "Admins can view analytics events" 
  ON public.analytics_events 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));
