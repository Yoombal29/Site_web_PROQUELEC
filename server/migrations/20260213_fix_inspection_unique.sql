-- FIX: Add Unique Constraint to Inspection Results
-- Ensures only one result per item per inspection

ALTER TABLE public.inspection_results 
ADD CONSTRAINT unique_inspection_item 
UNIQUE (inspection_id, checklist_item_id);
