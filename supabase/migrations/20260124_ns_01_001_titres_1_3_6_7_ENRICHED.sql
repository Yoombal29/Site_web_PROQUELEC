-- ============================================================================
-- SQL CONSOLIDÉ FINAL : NS 01-001 TITRES 1-3 + 6-7 (FONDATIONS + VALIDATION)
-- Version enrichie avec formules et objectifs de sécurité détaillés
-- ============================================================================

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NS 01.001')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, prohibitions, formulas) VALUES

-- ============================================================================
-- TITRE 1 : DOMAINE D'APPLICATION, OBJET ET PRINCIPES FONDAMENTAUX
-- ============================================================================

((SELECT id FROM book), 'Titre 1 / Chapitre 11', 'Art 111.1',
'La présente norme s''applique principalement aux installations électriques des bâtiments à usage d''habitation, commercial, ERP, industriels, agricoles, chantiers, marinas et éclairage public.',
'Définir le périmètre légal et technique d''application de la norme NS 01-001.',
'Toutes installations électriques BT au Sénégal.',
NULL, NULL),

((SELECT id FROM book), 'Titre 1 / Chapitre 11', 'Art 112.1',
'La norme est applicable aux circuits alimentés sous une tension nominale au plus égale à 1 000 V en courant alternatif et à 1 500 V en courant continu. Les fréquences préférentielles sont 50 Hz, 60 Hz et 400 Hz.',
'Définir les limites de la basse tension pour la validité des prescriptions normatives.',
'Installations BT de fréquence standard.',
NULL, NULL),

((SELECT id FROM book), 'Titre 1 / Chapitre 13', 'Art 131.1',
'Les installations électriques doivent être conçues et réalisées de manière à assurer la sécurité des personnes et des biens contre les chocs électriques, les effets thermiques, les surintensités, les courants de défaut et les surtensions.',
'Énoncer les principes fondamentaux de sécurité régissant toute l''installation.',
'Phase de conception et de réalisation.',
NULL, NULL),

-- ============================================================================
-- TITRE 2 : DÉFINITIONS
-- ============================================================================

((SELECT id FROM book), 'Titre 2 / Chapitre 21', 'Art 212.1',
'Tension assignée (Un) : Tension par rapport à laquelle est définie une installation électrique ou un matériel électrique.',
'Standardiser les niveaux de tension pour garantir l''interopérabilité et la sécurité des matériels.',
'Spécification des matériels et de l''installation.',
NULL, NULL),

((SELECT id FROM book), 'Titre 2 / Chapitre 23', 'Art 232.8',
'Masse : Partie conductrice d''un matériel électrique susceptible d''être touchée, qui n''est pas normalement sous tension, mais peut le devenir en cas de défaut d''isolement.',
'Identifier les parties métalliques présentant un risque de contact indirect.',
'Tout matériel électrique de classe I.',
NULL, NULL),

((SELECT id FROM book), 'Titre 2 / Chapitre 24', 'Art 243.1',
'Liaison équipotentielle : Liaison électrique mettant au même potentiel des masses et des éléments conducteurs.',
'Éliminer les différences de potentiel dangereuses entre parties métalliques simultanément accessibles.',
'Interconnexion des masses et éléments conducteurs.',
NULL, NULL),

-- ============================================================================
-- TITRE 3 : CARACTÉRISTIQUES GÉNÉRALES
-- ============================================================================

((SELECT id FROM book), 'Titre 3 / Chapitre 31', 'Art 311.1',
'Une détermination de la puissance d''alimentation est essentielle pour une conception économique et sûre d''une installation dans les limites de température et de chute de tension.',
'Garantir que la source d''énergie est dimensionnée pour les besoins réels sans risque de surcharge.',
'Étude de bilan de puissance.',
NULL, NULL),

((SELECT id FROM book), 'Titre 3 / Chapitre 31', 'Art 311.3',
'Le courant d''emploi IB est déterminé à partir de la puissance nominale Pn en tenant compte des facteurs a (cos phi/rendement), b (utilisation), c (simultanéité), d (extension) et e (conversion).',
'Calculer le courant réel circulant dans les canalisations pour leur dimensionnement.',
'Dimensionnement des circuits.',
NULL, 
'{"IB_formula": "IB = Pn * a * b * c * d * e"}'),

((SELECT id FROM book), 'Titre 3 / Chapitre 31', 'Art 312.2',
'Les schémas des liaisons à la terre (SLT) sont identifiés par deux lettres : la première pour la situation de l''alimentation (T/I) et la deuxième pour les masses (T/N).',
'Définir la stratégie de protection contre les chocs électriques.',
'Choix du régime de neutre (TT, TN ou IT).',
NULL, NULL),

-- ============================================================================
-- TITRE 6 : VÉRIFICATIONS
-- ============================================================================

((SELECT id FROM book), 'Titre 6 / Chapitre 61', 'Art 610.1',
'Les installations électriques doivent faire l''objet de vérifications initiales lors de la mise en service et périodiques durant leur exploitation.',
'Garantir la conformité initiale et le maintien du niveau de sécurité dans le temps.',
'Obligatoire pour toute installation.',
NULL, NULL),

((SELECT id FROM book), 'Titre 6 / Chapitre 61', 'Art 611.1',
'La vérification doit porter sur l''absence de tension, la continuité des conducteurs de protection, la résistance d''isolement et le fonctionnement des protections.',
'Valider par des mesures physiques la sécurité de l''installation.',
'Processus de réception technique.',
NULL, NULL),

-- ============================================================================
-- TITRE 7 : EMPLACEMENTS SPÉCIAUX
-- ============================================================================

((SELECT id FROM book), 'Titre 7 / Chapitre 701', 'Art 701.1',
'Dans les salles d''eau, les règles de protection sont renforcées en découpant le local en volumes 0, 1 et 2 selon la proximité des points d''eau.',
'Protéger les personnes dans les zones où l''impédance du corps humain est réduite par l''humidité.',
'Salles de bains et salles d''eau.',
NULL, NULL),

((SELECT id FROM book), 'Titre 7 / Chapitre 704', 'Art 704.1',
'Les installations de chantiers doivent être protégées par des dispositifs à courant différentiel-résiduel de haute sensibilité (30 mA) pour tous les circuits terminaux.',
'Assurer une protection maximale dans des environnements mécaniquement agressifs et temporaires.',
'Chantiers de construction.',
NULL, NULL)

ON CONFLICT (book_id, chapter_ref, article_ref) DO UPDATE SET
    content_exact = EXCLUDED.content_exact,
    safety_objective = EXCLUDED.safety_objective,
    application_conditions = EXCLUDED.application_conditions,
    formulas = EXCLUDED.formulas;
