-- Migration: Add Postgres NOTIFY triggers for real-time SSE broadcasts
-- Date: 2026-02-11
-- Purpose: Enable instant notifications when pages, theme_settings, or media_files are modified
-- These triggers emit pg_notify events that the Express server listens to and broadcasts via SSE

-- Create or replace the notif function
CREATE OR REPLACE FUNCTION public.notify_event() RETURNS trigger AS $$
DECLARE
  notification json;
BEGIN
  notification = json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'data', CASE
              WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
              ELSE row_to_json(NEW)
            END
  );

  PERFORM pg_notify(
    TG_TABLE_NAME || '_' || lower(TG_OP),
    notification::text
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (prevent duplication errors)
DROP TRIGGER IF EXISTS pages_notify_insert ON public.pages;
DROP TRIGGER IF EXISTS pages_notify_update ON public.pages;
DROP TRIGGER IF EXISTS pages_notify_delete ON public.pages;
DROP TRIGGER IF EXISTS theme_settings_notify_update ON public.theme_settings;
DROP TRIGGER IF EXISTS media_files_notify_insert ON public.media_files;
DROP TRIGGER IF EXISTS media_files_notify_update ON public.media_files;
DROP TRIGGER IF EXISTS media_files_notify_delete ON public.media_files;
DROP TRIGGER IF EXISTS menu_items_notify_update ON public.menu_items;

-- Create triggers for pages table (INSERT, UPDATE, DELETE)
CREATE TRIGGER pages_notify_insert
  AFTER INSERT ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

CREATE TRIGGER pages_notify_update
  AFTER UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

CREATE TRIGGER pages_notify_delete
  AFTER DELETE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

-- Create trigger for theme_settings table (UPDATE only)
CREATE TRIGGER theme_settings_notify_update
  AFTER UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

-- Create triggers for media_files table (INSERT, UPDATE, DELETE)
CREATE TRIGGER media_files_notify_insert
  AFTER INSERT ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

CREATE TRIGGER media_files_notify_update
  AFTER UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

CREATE TRIGGER media_files_notify_delete
  AFTER DELETE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

-- Create trigger for menu_items table (UPDATE only)
CREATE TRIGGER menu_items_notify_update
  AFTER UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event();

-- Verification query
SELECT 'Postgres NOTIFY triggers added successfully' as migration_status;
