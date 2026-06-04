-- ========================================================
-- MIGRATION: Builder/Public immutable trigger alignment
-- ========================================================
-- Goal:
-- - CONTENT pages: fully editable.
-- - HYBRID pages: editable in Builder, while their functional blocks remain
--   protected by the React block implementation.
-- - FUNCTIONAL pages: structure and routing stay locked; only controlled
--   visual/SEO metadata can be updated.

CREATE OR REPLACE FUNCTION public.prevent_update_if_immutable() RETURNS trigger AS $$
DECLARE
    old_page_type text := COALESCE(OLD.design_options->>'page_type', '');
    allowed_functional_keys text[] := ARRAY[
        'meta_description',
        'meta_keywords',
        'meta_robots',
        'featured_image',
        'seo_options',
        'show_hero',
        'show_footer',
        'hero_title',
        'hero_subtitle',
        'hero_description',
        'hero_background_image',
        'hero_cta_text',
        'hero_cta_link',
        'hero_badge',
        'hero_gradient',
        'hero_buttons',
        'custom_css',
        'custom_js',
        'header_html',
        'footer_html',
        'updated_at',
        'updated_by',
        'version',
        'version_number'
    ];
BEGIN
    IF OLD.immutable THEN
        IF old_page_type = 'hybrid' THEN
            RETURN NEW;
        END IF;

        IF (to_jsonb(NEW) - allowed_functional_keys) = (to_jsonb(OLD) - allowed_functional_keys) THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Immutable page cannot be updated';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_prevent ON public.pages;
CREATE TRIGGER trg_immutable_prevent
BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.prevent_update_if_immutable();
