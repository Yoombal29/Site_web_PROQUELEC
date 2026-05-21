-- ============================================================================
-- SQL CONSOLIDÉ FINAL : NS 01-001 TITRES 4 + 5 (COMPLET)
-- Protection + Matériel = Plateforme Opérationnelle
-- À exécuter dans le SQL Editor de proquelec
-- ============================================================================

WITH book AS (SELECT id FROM normative_books WHERE ref_code = 'NS 01.001')
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, prohibitions, formulas) VALUES 

-- ============================================================================
-- TITRE 4 : PROTECTION POUR ASSURER LA SÉCURITÉ
-- ============================================================================

-- Lot #1 : Fondations & Généralités
((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 410.1', 
'La présente partie traite de la protection contre les chocs électriques dans les installations électriques. Elle se fonde sur la norme NF C 20-030, norme fondamentale de sécurité applicable à la protection des personnes et des animaux domestiques, destinée à donner les principes et prescriptions essentiels communs aux installations et aux matériels ou nécessaires à leur coordination. La règle essentielle pour la protection contre les chocs électriques, telle que définie dans la norme NF C 20-030, est que les parties actives dangereuses ne soient pas accessibles et que les parties conductrices accessibles ne soient pas dangereuses, tant dans des conditions normales que dans des conditions de défaut simple.', 
'Garantir l''inaccessibilité des parties actives et la non-dangerosité des parties conductrices accessibles.', 
'Installations électriques basse tension.', 
'{"les parties actives dangereuses ne soient pas accessibles"}', NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 410.3.1', 
'Une ou plusieurs des mesures de protection suivantes, constituées chacune d''une disposition de protection contre les contacts directs et d''une disposition de protection contre les contacts indirects, doivent être appliquées, sauf spécifications contraires indiquées en 410.3.2 et 410.3.4, dans chaque installation ou partie d''installation, en tenant compte des conditions d''influences externes et doivent être considérées lors du choix et de la mise en œuvre des matériels : - mesure de protection par coupure automatique de l''alimentation, - mesure de protection par isolation double ou renforcée, - mesure de protection par séparation électrique pour l''alimentation d''un seul matériel, - mesure de protection par très basse tension.', 
'Définir les mesures fondamentales de protection à appliquer systématiquement.', 
'Toute installation ou partie d''installation.', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 411.3.1.1', 
'Dans chaque bâtiment, le conducteur principal de protection, la borne principale de terre et les éléments conducteurs suivants doivent être connectés à la liaison équipotentielle principale : - canalisations métalliques, par exemple eau, gaz, canalisations de chauffage central et de conditionnement d''air ; - éléments métalliques de la construction et armatures du béton armé ; - gaines ou tresses métalliques des câbles de communication. Lorsque de tels éléments conducteurs proviennent de l''extérieur du bâtiment, ils doivent être reliés à la liaison équipotentielle principale aussi près que possible de leur point d''entrée dans le bâtiment.', 
'Assurer l''équipotentialité pour éviter les différences de potentiel dangereuses.', 
'Dans chaque bâtiment (Liaison Équipotentielle Principale).', NULL, NULL),

-- Lot #2 : SLT, Surintensités & Sectionnement
((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 411.3.1.2', 
'Les masses doivent être reliées à un conducteur de protection selon les conditions particulières des divers schémas des liaisons à la terre comme spécifié de 411.4 à 411.6. Les masses simultanément accessibles doivent être connectées à la même prise de terre.', 
'Prévention des tensions de contact entre masses simultanément accessibles.', 
'Tous schémas (TT, TN, IT).', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 411.4.1', 
'Les masses de l''installation doivent être reliées par des conducteurs de protection à la borne principale de terre de l''installation, laquelle doit être connectée au point de l''alimentation mis à la terre.', 
'Raccordement des masses à la terre via le point de l''alimentation.', 
'Schéma TN uniquement.', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-41', 'Art 411.5.1', 
'Toutes les masses protégées par un même dispositif de protection doivent être connectées à des conducteurs de protection reliés à une même prise de terre. Si plusieurs dispositifs de protection sont montés en série, cette prescription s''applique séparément à toutes les masses protégées par le même dispositif.', 
'Raccordement des masses à des prises de terre distinctes.', 
'Schéma TT uniquement.', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-43', 'Art 430.1', 
'Les conducteurs actifs doivent être protégés par un ou plusieurs dispositifs de coupure automatique contre les surcharges (433) et contre les courts-circuits (434). En outre, la protection contre les surcharges et la protection contre les courts-circuits doivent être coordonnées conformément à 435.', 
'Éviter la détérioration des isolants et les incendies d''origine électrique.', 
'Tous les conducteurs actifs.', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-46', 'Art 461.2', 
'Il doit être placé à l''origine de toute installation un dispositif de commande et un dispositif de sectionnement coupant tous les conducteurs actifs de l''ensemble de l''installation.', 
'Pouvoir isoler physiquement l''intégralité de l''installation pour maintenance ou urgence.', 
'À l''origine de toute installation.', NULL, NULL),

-- Lot #3 : Coordination des protections contre les surintensités
((SELECT id FROM book), 'Titre 4 / Partie 4-43', 'Art 433.1', 
'Les conducteurs doivent être protégés contre les surcharges par un ou plusieurs dispositifs de protection à maximum de courant coupant automatiquement le courant dans le conducteur en cas de surcharge, sauf dans les cas prévus en 433.3. Le dispositif de protection doit satisfaire aux deux conditions suivantes : IB ≤ In ≤ Iz et I2 ≤ 1,45 Iz où IB est le courant d''emploi du circuit, Iz est le courant admissible dans la canalisation, In est le courant assigné du dispositif de protection, I2 est le courant assurant effectivement le fonctionnement du dispositif de protection dans le temps conventionnel.', 
'Protection des conducteurs contre l''échauffement excessif dû aux surcharges.', 
'Tous les conducteurs actifs, sauf cas prévus en §433.3.', NULL, 
'{"IB_In_Iz": "IB ≤ In ≤ Iz", "I2_condition": "I2 ≤ 1,45 Iz"}'),

((SELECT id FROM book), 'Titre 4 / Partie 4-43', 'Art 434.1', 
'Les conducteurs doivent être protégés contre les courts-circuits par un ou plusieurs dispositifs de protection à maximum de courant coupant automatiquement le courant dans le conducteur en cas de court-circuit, sauf dans les cas prévus en 434.3. Le dispositif de protection doit être capable d''interrompre tout courant de court-circuit survenant dans le circuit avant que ce courant ne devienne dangereux en raison des effets thermiques et mécaniques produits dans les conducteurs et les connexions.', 
'Prévention de la destruction des conducteurs et des risques d''incendie.', 
'Tous les conducteurs actifs.', NULL, NULL),

((SELECT id FROM book), 'Titre 4 / Partie 4-43', 'Art 434.5.2', 
'La contrainte thermique que peut supporter un conducteur sans dommage doit être supérieure à la contrainte thermique que peut laisser passer le dispositif de protection. Cette condition est satisfaite si : I²t ≤ k²S² où I est la valeur efficace du courant de court-circuit présumé, t est le temps de coupure du dispositif de protection, S est la section du conducteur, k est un coefficient dépendant du matériau du conducteur et de son isolation.', 
'Garantir que le conducteur supporte l''énergie thermique du court-circuit pendant le temps de coupure.', 
'Vérification de la coordination protection-conducteur.', NULL, 
'{"thermal_constraint": "I²t ≤ k²S²"}'),

((SELECT id FROM book), 'Titre 4 / Partie 4-43', 'Art 435.1', 
'Lorsqu''un dispositif de protection assure à la fois la protection contre les surcharges et la protection contre les courts-circuits, les caractéristiques de ce dispositif doivent satisfaire aux prescriptions de 433 et de 434.', 
'Application simultanée des prescriptions de protection contre les surcharges et les courts-circuits.', 
'Dispositif combiné (disjoncteur ou fusible).', NULL, NULL),

-- ============================================================================
-- TITRE 5 : CHOIX ET MISE EN ŒUVRE DES MATÉRIELS
-- ============================================================================

-- Lot #4 : Canalisations & Chute de tension
((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 521.1', 
'Les prescriptions de la présente partie s''appliquent au choix et à la mise en œuvre des canalisations électriques, y compris les conducteurs et câbles, dans les installations électriques.',
'Définir le cadre d''application des règles de canalisations.',
'Toutes installations électriques BT.', NULL, NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 523.1', 
'Les courants admissibles dans les conducteurs et câbles doivent être déterminés conformément aux tableaux de courants admissibles en fonction de la section des conducteurs, du mode de pose, du nombre de conducteurs chargés et de la température ambiante. Des facteurs de correction doivent être appliqués selon les conditions d''installation.',
'Éviter l''échauffement excessif des conducteurs.',
'Tous types de canalisations.', NULL, NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 524.1', 
'La section des conducteurs doit être déterminée en fonction du courant d''emploi, de la chute de tension admissible et des contraintes mécaniques. La section minimale des conducteurs de phase doit être de 1,5 mm² pour les circuits d''éclairage et de 2,5 mm² pour les circuits de prises de courant.',
'Garantir la tenue mécanique et électrique des conducteurs.',
'Installations domestiques et tertiaires.', NULL, NULL),

((SELECT id FROM book), 'Titre 5 / Partie 5-52', 'Art 525', 
'La chute de tension entre l''origine de l''installation et tout point d''utilisation ne doit pas dépasser les valeurs suivantes : 3% pour les circuits d''éclairage, 5% pour les autres usages. Pour le calcul de la chute de tension, la formule suivante doit être utilisée : ΔU = (ρ × L × IB) / S pour les circuits monophasés, où ρ est la résistivité du conducteur, L la longueur du circuit, IB le courant d''emploi et S la section du conducteur.',
'Maintien de la performance des appareils électriques.',
'Toute installation BT.', NULL,
'{"monophase": "ΔU = (ρ × L × IB) / S", "limits": {"lighting": 0.03, "other": 0.05}, "rho_copper": 0.0225}'),

((SELECT id FROM book), 'Titre 5 / Partie 5-53', 'Art 530.1', 
'Tout circuit doit être protégé contre les surintensités par un dispositif de protection à maximum de courant (disjoncteur ou fusible) dont les caractéristiques doivent être adaptées à la section des conducteurs et au courant d''emploi du circuit.',
'Protection des conducteurs et des personnes.',
'Tous les circuits.', NULL, NULL)

ON CONFLICT DO NOTHING;
