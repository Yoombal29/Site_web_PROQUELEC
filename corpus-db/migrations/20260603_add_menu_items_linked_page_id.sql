-- ========================================================
-- MIGRATION: Ensure menu items can stay linked to pages
-- ========================================================
-- The admin menu editor and page save flow already use linked_page_id to keep
-- menu URLs synchronized when a page slug changes. Some local schemas missed
-- this column, which caused save-time MenuSync warnings.

ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS linked_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_menu_items_linked_page_id
ON public.menu_items(linked_page_id);
