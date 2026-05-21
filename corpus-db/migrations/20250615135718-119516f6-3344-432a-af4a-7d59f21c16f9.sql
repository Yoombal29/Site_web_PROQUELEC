
-- Étape 1 : Enum des rôles possibles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Étape 2 : Table d’association utilisateurs <-> rôles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Étape 3 : RLS sur la table des rôles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Étape 4 : Fonction pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY definer
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- NB : tu pourras affecter le rôle 'admin' au compte créé via proquelec admin plus tard.
