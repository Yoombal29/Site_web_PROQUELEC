-- Migration pour marquer toutes les pages comme publiées
UPDATE pages
SET is_published = true
WHERE slug IN ('events', 'contact', 'trainings', 'about', 'documents', 'certifications', 'activities', 'labels')
AND is_published = false;
