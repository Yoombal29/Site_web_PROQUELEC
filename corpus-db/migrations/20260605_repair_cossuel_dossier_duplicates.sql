-- Repair legacy duplicate COSSUEL dossier rows.
-- Some local/prod databases may contain duplicated ids from older sync scripts,
-- which breaks ON CONFLICT upserts despite the primary key definition.

WITH ranked AS (
    SELECT
        ctid,
        ROW_NUMBER() OVER (
            PARTITION BY id
            ORDER BY
                COALESCE(last_sync_at, submission_date) DESC NULLS LAST,
                ctid DESC
        ) AS row_rank
    FROM public.cossuel_dossiers
    WHERE id IS NOT NULL
)
DELETE FROM public.cossuel_dossiers d
USING ranked r
WHERE d.ctid = r.ctid
  AND r.row_rank > 1;

DELETE FROM public.cossuel_dossiers
WHERE id IS NULL OR btrim(id) = '';

REINDEX INDEX public.cossuel_dossiers_pkey;
