-- SQL INJECTION : TITRE 5 - Choix et mise en œuvre des matériels (Lot #4)
-- Articles critiques pour les calculateurs d'ingénierie
-- À exécuter dans le SQL Editor de Supabase

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NS 01.001')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, formulas) VALUES 

-- ========== PARTIE 5-52 : CANALISATIONS ==========
((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 521.1', 
'Les prescriptions de la présente partie s''appliquent au choix et à la mise en œuvre des canalisations électriques, y compris les conducteurs et câbles, dans les installations électriques.',
'Définir le cadre d''application des règles de canalisations.',
'Toutes installations électriques BT.', NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 523.1', 
'Les courants admissibles dans les conducteurs et câbles doivent être déterminés conformément aux tableaux de courants admissibles en fonction de la section des conducteurs, du mode de pose, du nombre de conducteurs chargés et de la température ambiante. Des facteurs de correction doivent être appliqués selon les conditions d''installation.',
'Éviter l''échauffement excessif des conducteurs.',
'Tous types de canalisations.', NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 524.1', 
'La section des conducteurs doit être déterminée en fonction du courant d''emploi, de la chute de tension admissible et des contraintes mécaniques. La section minimale des conducteurs de phase doit être de 1,5 mm² pour les circuits d''éclairage et de 2,5 mm² pour les circuits de prises de courant.',
'Garantir la tenue mécanique et électrique des conducteurs.',
'Installations domestiques et tertiaires.', NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 525', 
'La chute de tension entre l''origine de l''installation et tout point d''utilisation ne doit pas dépasser les valeurs suivantes : 3% pour les circuits d''éclairage, 5% pour les autres usages. Pour le calcul de la chute de tension, la formule suivante doit être utilisée : ΔU = (ρ × L × IB) / S pour les circuits monophasés, où ρ est la résistivité du conducteur, L la longueur du circuit, IB le courant d''emploi et S la section du conducteur.',
'Maintien de la performance des appareils électriques.',
'Toute installation BT.', 
'{"monophase": "ΔU = (ρ × L × IB) / S", "limits": {"lighting": 0.03, "other": 0.05}, "rho_copper": 0.0225}'),

-- ========== PARTIE 5-53 : APPAREILLAGE ==========
((SELECT id FROM book), 'Titre 5 / Partie 5-53', 'Art 530.1', 
'Tout circuit doit être protégé contre les surintensités par un dispositif de protection à maximum de courant (disjoncteur ou fusible) dont les caractéristiques doivent être adaptées à la section des conducteurs et au courant d''emploi du circuit.',
'Protection des conducteurs et des personnes.',
'Tous les circuits.', NULL)

ON CONFLICT DO NOTHING;
