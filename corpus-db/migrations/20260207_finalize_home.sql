-- Final adjustments for Home Page and Header CTAs
UPDATE site_settings 
SET cta_primary_text = 'Contactez-nous', 
    cta_primary_url = '/contact'
WHERE cta_primary_text IS NULL OR cta_primary_text = 'Devis' OR cta_primary_text = '';

UPDATE home_slides 
SET cta_text = 'Contactez-nous', 
    cta_link = '/contact' 
WHERE title LIKE 'Promotion%';

-- Ensure some stats exist for LandingStats
DELETE FROM home_stats;
INSERT INTO home_stats (label, value, icon_name, description, display_order)
VALUES 
('Années d''expertise', '28+', 'award', 'Depuis 1995 au service du Sénégal', 1),
('Électriciens Certifiés', '1,200+', 'users', 'Un réseau d''artisans qualifiés', 2),
('Marchés Sécurisés', '150+', 'shield', 'Infrastructures commerciales protégées', 3),
('Installations Auditées', '5,000+', 'zap', 'Diagnostics rigoureux effectués', 4);

-- Ensure some testimonials exist for LandingTestimonials
DELETE FROM testimonials;
INSERT INTO testimonials (name, role, content, rating)
VALUES 
('M. Diop', 'Autorité Locale', 'PROQUELEC a transformé la sécurité de nos marchés. Un partenaire indispensable.', 5),
('Mme Fall', 'Ménage', 'Grâce au diagnostic de PROQUELEC, nous dormons l''esprit tranquille.', 5),
('S. Kane', 'Électricien Certifié', 'La formation PROQUELEC m''a permis de monter en compétence et en crédibilité.', 4);
