-- Migration de débogage : Suppression du trigger suspect
-- On soupçonne qu'un trigger "calculate_reading_time" existe en prod mais pas en local, 
-- et qu'il cause l'erreur "numeric field overflow".

BEGIN;

-- Suppression du trigger s'il existe
DROP TRIGGER IF EXISTS calculate_reading_time ON public.pages;
DROP TRIGGER IF EXISTS update_reading_time ON public.pages;

-- Suppression de la fonction associée
DROP FUNCTION IF EXISTS public.calculate_reading_time();
DROP FUNCTION IF EXISTS public.update_reading_time();

COMMIT;
