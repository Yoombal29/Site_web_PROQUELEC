-- Add is_active and is_deleted columns to media_files table if they don't exist
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
