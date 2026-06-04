-- ========================================================
-- MIGRATION: Backfill missing Builder structures
-- ========================================================
-- Content pages without structure_json were rendered through legacy HTML.
-- Store the same HTML in a Craft.js HtmlBlock so Builder and public pages use
-- the same JSON source.

WITH structures AS (
  SELECT
    id,
    jsonb_build_object(
      'ROOT', jsonb_build_object(
        'type', 'div',
        'nodes', jsonb_build_array('html_wrapper'),
        'props', jsonb_build_object('style', jsonb_build_object()),
        'linkedNodes', jsonb_build_object()
      ),
      'html_wrapper', jsonb_build_object(
        'type', jsonb_build_object('resolvedName', 'ContainerBlock'),
        'nodes', jsonb_build_array('html_block'),
        'props', jsonb_build_object(
          'padding', 48,
          'paddingY', 32,
          'backgroundColor', '#ffffff',
          'maxWidth', '1200px'
        ),
        'parent', 'ROOT',
        'linkedNodes', jsonb_build_object(),
        'isCanvas', true,
        'displayName', 'ContainerBlock'
      ),
      'html_block', jsonb_build_object(
        'type', jsonb_build_object('resolvedName', 'HtmlBlock'),
        'nodes', jsonb_build_array(),
        'props', jsonb_build_object(
          'html', COALESCE(NULLIF(content_raw, ''), NULLIF(content, ''), '<p>Contenu en cours de création...</p>'),
          'padding', 0,
          'hideLabel', true
        ),
        'parent', 'html_wrapper',
        'linkedNodes', jsonb_build_object(),
        'isCanvas', false,
        'displayName', 'HtmlBlock'
      )
    ) AS craft_structure
  FROM public.pages
  WHERE COALESCE(immutable, false) = false
    AND (
      structure_json IS NULL
      OR structure_json = '[]'::jsonb
      OR structure_json = '{}'::jsonb
    )
)
UPDATE public.pages AS pages
SET
  structure_json = structures.craft_structure,
  draft_json = CASE
    WHEN pages.draft_json IS NULL
      OR pages.draft_json = '[]'::jsonb
      OR pages.draft_json = '{}'::jsonb
      THEN structures.craft_structure
    ELSE pages.draft_json
  END
FROM structures
WHERE pages.id = structures.id;
