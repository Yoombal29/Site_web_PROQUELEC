-- ========================================================
-- MIGRATION: Compact Postgres NOTIFY payloads
-- ========================================================
-- PostgreSQL limits pg_notify payloads to 8000 bytes. Builder pages store
-- large Craft.js graphs in structure_json/draft_json, so sending row_to_json(NEW)
-- breaks autosave and publish operations with "payload string too long".

CREATE OR REPLACE FUNCTION public.notify_event() RETURNS trigger AS $$
DECLARE
  notification jsonb;
  row_data jsonb;
  source_data jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    source_data := to_jsonb(OLD);
  ELSE
    source_data := to_jsonb(NEW);
  END IF;

  row_data := jsonb_strip_nulls(jsonb_build_object(
    'id', source_data->>'id',
    'slug', COALESCE(source_data->>'slug', source_data->>'url'),
    'title', COALESCE(source_data->>'title', source_data->>'name', source_data->>'file_name'),
    'updated_at', source_data->>'updated_at'
  ));

  notification := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'data', row_data
  );

  PERFORM pg_notify(
    TG_TABLE_NAME || '_' || lower(TG_OP),
    notification::text
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_notify_insert ON public.pages;
DROP TRIGGER IF EXISTS pages_notify_update ON public.pages;
DROP TRIGGER IF EXISTS pages_notify_delete ON public.pages;

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
