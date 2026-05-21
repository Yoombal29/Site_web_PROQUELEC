-- ============================================================================
-- SQL CONSOLIDÉ FINAL : NS 01-001 TITRES 1-3 + 6-7 (FONDATIONS + VALIDATION)
-- Complète la norme pour une plateforme 100% opérationnelle
-- À exécuter APRÈS les Titres 4+5
-- ============================================================================

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NS 01.001')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, prohibitions, formulas) VALUES

-- ============================================================================
-- TITRE 1 : DOMAINE D'APPLICATION
-- ============================================================================

((SELECT id FROM book), 'Titre 1 / Chapitre 11', 'Art 110.1',
'La présente norme s''applique aux installations électriques à basse tension, c''est-à-dire aux installations dans lesquelles toutes les tensions nominales ne dépassent pas 1000 V en courant alternatif et 1500 V en courant continu.',
'Définir le périmètre d''application de la norme.',
'Toutes installations électriques BT.',
NULL, NULL),

((SELECT id FROM book), 'Titre 1 / Chapitre 11', 'Art 111.1',
'Les installations électriques doivent être conçues, réalisées et vérifiées de manière à assurer la sécurité des personnes et des biens, ainsi que le bon fonctionnement des équipements.',
'Assurer la sécurité et la fonctionnalité des installations.',
'Toutes installations.',
NULL, NULL),

-- ============================================================================
-- TITRE 2 : DÉFINITIONS
-- ============================================================================

((SELECT id FROM book), 'Titre 2 / Chapitre 21', 'Art 210.1',
'Tension nominale : Tension par rapport à laquelle est définie une installation électrique ou un matériel électrique.',
'Définir les termes techniques fondamentaux.',
'Toutes installations.',
NULL, NULL),

((SELECT id FROM book), 'Titre 2 / Chapitre 21', 'Art 211.1',
'Courant nominal : Courant que peut supporter en permanence un matériel électrique dans des conditions spécifiées.',
'Définir les caractéristiques des matériels.',
'Tous matériels électriques.',
NULL, NULL),

-- ============================================================================
-- TITRE 3 : PROTECTION GÉNÉRALE - DÉTERMINATION DES CONDITIONS DE MISE À LA TERRE
-- ============================================================================

((SELECT id FROM book), 'Titre 3 / Chapitre 31', 'Art 310.1',
'Les installations doivent être mises à la terre selon l''un des schémas suivants : TN, TT ou IT.',
'Choisir le schéma de mise à la terre approprié.',
'Toutes installations BT.',
NULL, NULL),

((SELECT id FROM book), 'Titre 3 / Chapitre 31', 'Art 311.1',
'Le choix du schéma de liaison à la terre doit tenir compte des conditions locales, des risques particuliers et des exigences de disponibilité de l''installation.',
'Adapter le schéma aux contraintes spécifiques.',
'Toutes installations.',
NULL, NULL),

-- ============================================================================
-- TITRE 6 : VÉRIFICATION
-- ============================================================================

((SELECT id FROM book), 'Titre 6 / Chapitre 61', 'Art 610.1',
'Les installations électriques doivent faire l''objet de vérifications initiales et périodiques.',
'Assurer la maintenance et la sécurité continues.',
'Toutes installations en service.',
NULL, NULL),

((SELECT id FROM book), 'Titre 6 / Chapitre 61', 'Art 611.1',
'Les vérifications doivent porter sur : - l''absence de tension, - la continuité des conducteurs de protection, - l''isolement, - la protection contre les contacts directs et indirects.',
'Vérifier tous les aspects de sécurité.',
'Toutes vérifications.',
NULL, NULL),

((SELECT id FROM book), 'Titre 6 / Chapitre 61', 'Art 612.1',
'Les vérifications doivent être effectuées par du personnel compétent et habilité selon la norme NF C 18-510.',
'Garantir la compétence des vérificateurs.',
'Toutes interventions.',
NULL, NULL),

-- ============================================================================
-- TITRE 7 : LOCAUX À RISQUES PARTICULIERS
-- ============================================================================

((SELECT id FROM book), 'Titre 7 / Chapitre 71', 'Art 710.1',
'Les salles d''eau et les piscines font l''objet de prescriptions particulières en raison des risques accrus d''électrocution.',
'Protéger dans les environnements humides.',
'Salles d''eau, piscines.',
NULL, NULL),

((SELECT id FROM book), 'Titre 7 / Chapitre 71', 'Art 711.1',
'Dans les volumes 0, 1 et 2 des salles d''eau, seuls les matériels de classe II ou alimentés en très basse tension de sécurité sont autorisés.',
'Réduire les risques dans les zones critiques.',
'Volumes 0, 1, 2 des salles d''eau.',
NULL, NULL),

((SELECT id FROM book), 'Titre 7 / Chapitre 72', 'Art 720.1',
'Les chantiers de construction font l''objet de prescriptions temporaires adaptées aux conditions de chantier.',
'Adapter la sécurité aux contraintes de chantier.',
'Installations temporaires.',
NULL, NULL)

ON CONFLICT (book_id, chapter_ref, article_ref) DO NOTHING;

-- ============================================================================
-- VÉRIFICATION DE L'INJECTION
-- ============================================================================

SELECT
    'NS 01-001 Titres 1-3 + 6-7' as norme_injectee,
    COUNT(*) as articles_injectes,
    string_agg(DISTINCT chapter_ref, ', ') as chapitres_couverts
FROM normative_articles na
JOIN normative_books nb ON na.book_id = nb.id
WHERE nb.ref_code = 'NS 01-001'
AND na.chapter_ref LIKE 'Titre %';
