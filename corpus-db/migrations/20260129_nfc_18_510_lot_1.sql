-- ============================================================================
-- ATOMISATION NF C 18-510 - LOT #1 : FONDATIONS & HABILITATIONS
-- Objectif : Sécurité humaine et prévention du risque électrique
-- ============================================================================

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NF C 18-510')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, prohibitions) VALUES

((SELECT id FROM book), 'Chapitre 1', 'Art 1.1',
'La présente norme prescrit les mesures de sécurité à appliquer lors des opérations de toute nature sur les ouvrages et installations électriques, afin de prévenir les accidents d''origine électrique.',
'Définir l''objectif fondamental de protection des personnes contre les chocs électriques et les brûlures.',
'Toutes opérations (travaux, interventions, manoeuvres) sur ou au voisinage de l''électricité.',
NULL),

((SELECT id FROM book), 'Chapitre 3', 'Art 3.2.1',
'L''habilitation est la reconnaissance, par l''employeur, de la capacité d''une personne à accomplir en sécurité les tâches qui lui sont confiées vis-à-vis du risque électrique.',
'Garantir que seul du personnel formé et compétent intervient sur les installations.',
'Individuelle et nominative. Doit être précédée d''une formation et d''un avis médical.',
ARRAY['Interdiction de faire travailler une personne non habilitée dans des zones à risque.']),

((SELECT id FROM book), 'Chapitre 3', 'Art 3.2.5',
'Les symboles d''habilitation sont composés de lettres et de chiffres : B (Basse Tension), H (Haute Tension), 0 (Exécutant non-électricien), 1 (Exécutant électricien), 2 (Chargé de travaux), C (Chargé de consignation), R (Chargé d''intervention).',
'Standardiser les niveaux de responsabilité et les périmètres d''intervention.',
'Dépend de la nature de l''opération et du domaine de tension.',
NULL),

((SELECT id FROM book), 'Chapitre 4', 'Art 4.1.1',
'L''employeur doit procéder à l''analyse du risque électrique avant toute opération. Cette analyse détermine les procédures, les équipements de protection (EPI/EPC) et le niveau d''habilitation requis.',
'Systématiser la prévention avant le début de tout travail.',
'Obligatoire avant chaque chantier ou intervention.',
ARRAY['Ne jamais débuter une opération sans évaluation préalable du risque.']),

((SELECT id FROM book), 'Chapitre 7', 'Art 7.1.1',
'La consignation est l''opération qui consiste à isoler un ouvrage ou une installation de ses sources de tension et à le maintenir dans cet état pour permettre des travaux hors tension en sécurité.',
'Supprimer le danger à la source pour une sécurité totale.',
'Obligatoire pour les travaux hors tension. Comporte 5 étapes clés.',
ARRAY['Interdiction de considérer une installation "hors tension" sans vérification d''absence de tension (VAT).'])

ON CONFLICT (book_id, chapter_ref, article_ref) DO UPDATE SET
    content_exact = EXCLUDED.content_exact,
    safety_objective = EXCLUDED.safety_objective,
    application_conditions = EXCLUDED.application_conditions,
    prohibitions = EXCLUDED.prohibitions;
