-- ============================================================================
-- ATOMISATION NF C 18-510 - LOT #2 : ZONES ET DISTANCES DE SÉCURITÉ
-- Objectif : Délimitation des risques et règles d'approche
-- ============================================================================

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NF C 18-510')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, prohibitions) VALUES

((SELECT id FROM book), 'Chapitre 6', 'Art 6.3.1',
'Les zones d''environnement sont définies autour des pièces nues sous tension. En Basse Tension (BT), on distingue principalement la zone de voisinage simple (Zone 1) et la zone de voisinage renforcé (Zone 4).',
'Délimiter l''espace autour des conducteurs actifs pour adapter les mesures de prévention.',
'Applicable à tout local ou emplacement d''accès réservé aux électriciens.',
NULL),

((SELECT id FROM book), 'Chapitre 6', 'Art 6.3.2',
'La Distance Minimale d''Approche (DMA) en Basse Tension (BT) est fixée à 0,30 mètre. Au-delà de cette distance, on entre dans la zone de voisinage renforcé où des mesures spécifiques s''appliquent.',
'Empêcher tout contact accidentel ou réamorçage par maintien d''une distance de sécurité.',
'Tensions <= 1000V AC.',
ARRAY['Interdiction de franchir la DMA sans protection isolante ou mise hors tension.']),

((SELECT id FROM book), 'Chapitre 8', 'Art 8.2.1',
'La consignation d''une installation comporte obligatoirement les 5 étapes suivantes dans l''ordre : 1. Séparation, 2. Condamnation, 3. Identification, 4. Vérification d''Absence de Tension (VAT), 5. Mise à la terre et en court-circuit (si requis).',
'Garantir l''absence totale de risque électrique pendant toute la durée des travaux.',
'Procédure standard pour les travaux hors tension.',
ARRAY['Interdiction de shunter ou d''inverser l''ordre des étapes de consignation.']),

((SELECT id FROM book), 'Chapitre 10', 'Art 10.1.1',
'Les Équipements de Protection Individuelle (EPI) contre le risque électrique comprennent obligatoirement : les gants isolants, l''écran facial anti-UV, et les vêtements de travail en coton ou matériaux ignifugés.',
'Dernier rempart de sécurité en cas de défaillance des protections collectives.',
'Dépend de l''analyse des risques et du type d''opération.',
ARRAY['Interdiction d''utiliser des gants isolants percés ou dont la date de validité est dépassée.'])

ON CONFLICT (book_id, chapter_ref, article_ref) DO UPDATE SET
    content_exact = EXCLUDED.content_exact,
    safety_objective = EXCLUDED.safety_objective,
    application_conditions = EXCLUDED.application_conditions,
    prohibitions = EXCLUDED.prohibitions;
