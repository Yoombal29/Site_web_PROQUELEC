
ALTER TABLE public.site_settings
  ADD COLUMN contact_email TEXT NULL,
  ADD COLUMN phone_number TEXT NULL,
  ADD COLUMN address TEXT NULL,
  ADD COLUMN copyright_text TEXT NULL DEFAULT CONCAT('© ', EXTRACT(YEAR FROM NOW()), ' PROQUELEC. Tous droits réservés.'),
  ADD COLUMN facebook_url TEXT NULL,
  ADD COLUMN linkedin_url TEXT NULL,
  ADD COLUMN twitter_url TEXT NULL;
