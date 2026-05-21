-- Migration : Création du Corpus Normatif Central - "Coran Technique" v1.0
-- Basé sur le cahier des charges souverain de PROQUELEC

-- 1. Table des Livres (Normes)
CREATE TABLE IF NOT EXISTS normative_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code TEXT UNIQUE NOT NULL, -- ex: NFC 15-100, NS 01-001
    title TEXT NOT NULL,
    domain TEXT, -- ex: Basse Tension, Sécurité Humaine
    validity_scope TEXT,
    version TEXT DEFAULT '1.0',
    is_locked BOOLEAN DEFAULT true, -- Inviolable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table des Articulations (Articles)
CREATE TABLE IF NOT EXISTS normative_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES normative_books(id) ON DELETE CASCADE,
    chapter_ref TEXT NOT NULL, -- ex: Chapitre 52
    article_ref TEXT NOT NULL, -- ex: Art 525
    content_exact TEXT NOT NULL, -- Texte souverain
    safety_objective TEXT,
    application_conditions TEXT,
    prohibitions TEXT[], -- Liste des interdictions strictes
    formulas JSONB DEFAULT '{}', -- Formules mathématiques normées
    safety_thresholds JSONB DEFAULT '{}', -- Seuils de sécurité (humains/biens)
    is_premium BOOLEAN DEFAULT false,
    keywords tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexation pour recherche rapide par l'IA
CREATE INDEX IF NOT EXISTS idx_articles_fts ON normative_articles USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_articles_refs ON normative_articles(article_ref);

-- 3. Insertion du Catalogue Normatif Exhaustif (Coran Technique v1.0)
-- Note: Seules les têtes de ponts (Livres) sont insérées ici. Les articles atomiques seront injectés par lot.

-- BLOC A : INSTALLATIONS ÉLECTRIQUES
INSERT INTO normative_books (ref_code, title, domain, validity_scope) VALUES 
('NS 01.001', 'Règles des installations électriques à basse tension (≤ 1000 V)', 'Installations BT', 'Sénégal / Obligatoire'),
('NS 01-002', 'Postes de livraison intérieurs (NF C 13-100)', 'HT/BT', 'Sénégal'),
('NS 01-031', 'Installations électriques extérieures', 'VRD / Espace Public', 'Sénégal'),
('NS 01-037', 'État des installations électriques des logements', 'Diagnostic', 'Sénégal'),
('NFC 15-100', 'Installations électriques BT (Référence France)', 'Installations BT', 'Résidentiel / Tertiaire'),
('IEC 60364', 'Installations électriques BT (International)', 'Standard Mondial', 'International');

-- BLOC B : ÉCLAIRAGE & PERFORMANCES
INSERT INTO normative_books (ref_code, title, domain, validity_scope) VALUES 
('NS 01-004', 'Luminaires - Règles générales et essais', 'Éclairage', 'Matériel'),
('NS 01-032', 'Éclairage des lieux de travail intérieur (EN 12464-1)', 'Éclairage', 'Tertiaire'),
('NS 01-033', 'Éclairage des lieux de travail extérieur', 'Éclairage', 'Extérieur'),
('NS 01-034', 'Éclairage public', 'Éclairage', 'VRD'),
('NS ECOSTAND 053', 'Lampes à LED pour éclairage général', 'Performance', 'Efficacité'),
('NS ECOSTAND 054', 'Modules de LED pour éclairage général', 'Performance', 'Matériel');

-- BLOC C : CONDUCTEURS & CÂBLES
INSERT INTO normative_books (ref_code, title, domain, validity_scope) VALUES 
('NS 01-009', 'Câbles isolés au PVC de tension ≤ 450/750 V', 'Câbles', 'Bâtiment'),
('NF EN 60228', 'Âmes des conducteurs de câbles isolés', 'Câbles', 'Physique'),
('IEC 60227', 'Polyvinyl chloride insulated cables', 'Câbles', 'International'),
('IEC 60245', 'Rubber insulated cables', 'Câbles', 'International');

-- BLOC D : SÉCURITÉ & HABILITATION (LIVRE SUPRÊME)
INSERT INTO normative_books (ref_code, title, domain, validity_scope) VALUES 
('NF C 18-510', 'Prévention du risque électrique - Habilitations', 'Sécurité Humaine', 'Obligatoire Universel'),
('NF C 16-600', 'État des installations électriques existantes', 'Sécurité', 'Diagnostic');

-- BLOC E : APPAREILLAGE & PROTECTION
INSERT INTO normative_books (ref_code, title, domain, validity_scope) VALUES 
('NS 01-011', 'Disjoncteurs pour installations domestiques', 'Protection', 'Appareillage'),
('NS 01-013', 'Protection des structures contre la foudre', 'Foudre', 'Bâtiment'),
('IEC 61008', 'Interrupteurs différentiels (DDR)', 'Protection Humaine', 'BT'),
('IEC 60898', 'Disjoncteurs pour installations domestiques', 'Protection', 'Bâtiment'),
('IEC 60947', 'Appareillage à basse tension', 'Industrie', 'BT');

-- Exemple d'article souverain : La Loi de Sécurité (NF C 18-510)
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective)
SELECT id, 'Généralités', 'Safety-Mandate', 
'Toute intervention sur ou au voisinage d''une installation électrique doit être effectuée par du personnel habilité (B0, B1, B2, BR, BC, H0...).',
'Protection absolue de la vie humaine'
FROM normative_books WHERE ref_code = 'NF C 18-510';

-- Exemple d'article de calcul : Chute de tension (NS 01.001)
INSERT INTO normative_articles (book_id, chapter_ref, article_ref, content_exact, safety_objective, application_conditions, formulas)
SELECT id, 'Chapitre 52', 'Art 525', 
'La chute de tension dans les installations doit être limitée: 3% pour l''éclairage et 5% pour les autres usages.',
'Maintien de la performance des appareils',
'Installations BT standards',
'{"limits": {"lighting": 0.03, "other": 0.05}}'
FROM normative_books WHERE ref_code = 'NS 01.001';
