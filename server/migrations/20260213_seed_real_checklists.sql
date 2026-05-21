-- SEED: REAL CHECKLISTS NS 01-001
-- Description: Injects real technical checkpoints for "Habitation Neuve" based on Senegal Standards.

-- 1. Nettoyage préalable (pour éviter les doublons lors des tests)
DELETE FROM public.checklist_items WHERE checklist_id IN (SELECT id FROM public.checklists WHERE category = 'residentiel');
DELETE FROM public.checklists WHERE category = 'residentiel';

-- 2. Création de la Checklist "Habitation Neuve"
WITH new_checklist AS (
    INSERT INTO public.checklists (title, category, description, version)
    VALUES ('Contrôle Conformité Habitat Neuf (NS 01-001)', 'residentiel', 'Inspection complète des installations électriques domestiques neuves.', 1)
    RETURNING id
)
-- 3. Insertion des Points de Contrôle (Items)
INSERT INTO public.checklist_items (checklist_id, section, question, description, input_type, criticality_weight, order_index)
SELECT id, section, question, description, input_type, criticality_weight, order_index
FROM new_checklist, (VALUES 
    -- SECTION 1: PRISE DE TERRE
    ('Mise à la Terre', 'La valeur de la prise de terre est-elle inférieure à 100 Ohms ?', 'Mesurer avec un telluromètre. Valeur idéale < 50 Ohms.', 'number', 10, 1),
    ('Mise à la Terre', 'La barrette de mesure est-elle présente et accessible ?', 'Doit permettre de déconnecter la prise de terre pour mesure.', 'boolean', 5, 2),
    ('Mise à la Terre', 'La liaison équipotentielle principale (LEP) est-elle réalisée ?', 'Relie les conduites métalliques (eau, gaz) à la terre.', 'boolean', 8, 3),

    -- SECTION 2: TABLEAU DE RÉPARTITION
    ('Tableau Électrique', 'Le dispositif de coupure d''urgence (AGCP) est-il présent et accessible ?', 'Coupure générale en cas de danger.', 'boolean', 10, 4),
    ('Tableau Électrique', 'Tous les circuits sont-ils protégés par des différentiels 30mA ?', 'Protection des personnes obligatoire.', 'boolean', 10, 5),
    ('Tableau Électrique', 'Le repérage des circuits est-il clair et durable ?', 'Étiquettes ou pictogrammes sur le tableau.', 'boolean', 3, 6),
    ('Tableau Électrique', 'Il y a-t-il une réserve modulaire de 20% ?', 'Espace libre pour extensions futures.', 'boolean', 2, 7),

    -- SECTION 3: SALLE DE BAIN (ZONES)
    ('Salle de Bain', 'Les volumes de sécurité (0, 1, 2) sont-ils respectés ?', 'Aucun appareil électrique interdit dans les zones humides.', 'boolean', 10, 8),
    ('Salle de Bain', 'La liaison équipotentielle supplémentaire (LES) est-elle réalisée ?', 'Relie toutes les masses métalliques de la salle de bain.', 'boolean', 8, 9),

    -- SECTION 4: CIRCUITS & APPAREILLAGE
    ('Appareillage', 'Les socles de prises de courant ont-ils tous un puit de terre ?', 'Obligatoire pour toutes les prises (sauf rasoir).', 'boolean', 5, 10),
    ('Appareillage', 'Le nombre de prises par circuit respecte-t-il la norme ?', 'Max 8 prises pour 1.5mm², 12 pour 2.5mm².', 'boolean', 5, 11),
    ('Appareillage', 'Les connexions sont-elles toutes réalisées dans des boîtes ?', 'Pas de dominos volants ou encastrés sans boîte.', 'boolean', 5, 12)

) AS data(section, question, description, input_type, criticality_weight, order_index);
