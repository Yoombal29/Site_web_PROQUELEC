-- Table pour les boutons de téléchargement configurables par l'admin
create table if not exists download_buttons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bucket text not null,
  path text not null,
  icon text,
  color text,
  visible boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
