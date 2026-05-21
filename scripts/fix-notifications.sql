-- Create a slimmed down notification for large tables like 'pages'
CREATE OR REPLACE FUNCTION notify_event_slim()
RETURNS TRIGGER AS $$
DECLARE
  notification json;
BEGIN
  -- We only send id and slug to keep it under 8KB limit of pg_notify
  notification = json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'data', CASE
              WHEN TG_OP = 'DELETE' THEN json_build_object('id', OLD.id)
              ELSE json_build_object('id', NEW.id, 'slug', NEW.slug, 'title', NEW.title)
            END
  );

  PERFORM pg_notify(
    TG_TABLE_NAME || '_' || lower(TG_OP),
    notification::text
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Replace triggers on pages table
DROP TRIGGER IF EXISTS pages_notify_insert ON pages;
DROP TRIGGER IF EXISTS pages_notify_update ON pages;
DROP TRIGGER IF EXISTS pages_notify_delete ON pages;

CREATE TRIGGER pages_notify_insert
  AFTER INSERT ON pages
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_slim();

CREATE TRIGGER pages_notify_update
  AFTER UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_slim();

CREATE TRIGGER pages_notify_delete
  AFTER DELETE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_slim();
