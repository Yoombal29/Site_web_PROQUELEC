-- PROQUELEC MINIMAL SEED DATA - Simplified
-- Only core fields to avoid type conflicts

-- Connect to proquelec database
\c proquelec

INSERT INTO pages (
  id, title, slug, content, is_published, created_at, updated_at, 
  workflow_status, language_code
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Accueil - PROQUELEC Sénégal',
  'home',
  '<h1>Bienvenue à PROQUELEC</h1>',
  true,
  NOW(),
  NOW(),
  'published',
  'fr'
) ON CONFLICT (id) DO NOTHING;
