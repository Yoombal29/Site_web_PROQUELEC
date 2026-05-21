-- Update Documents page with complete content and structure
UPDATE pages SET
  content = '<h2>Centre de Documentation PROQUELEC</h2>

<p>Accédez à notre bibliothèque complète de guides techniques, fiches de sécurité et supports pédagogiques pour les professionnels de l''électricité au Sénégal.</p>

<h3>📚 Documents Disponibles</h3>

<h4>Guides & Manuels</h4>
<ul>
<li><strong>Mémento professionnel PROQUELEC</strong> - Guide complet des bonnes pratiques</li>
<li><strong>Guide installations électriques résidentielles</strong> - Normes et procédures</li>
<li><strong>Guide installations électriques industrielles</strong> - Solutions pour l''industrie</li>
</ul>

<h4>Fiches Techniques</h4>
<ul>
<li><strong>Fiche sécurité syndics</strong> - Avril 2024 - Sécurité pour les gestionnaires</li>
<li><strong>Fiche maintenance préventive</strong> - Protocoles d''entretien</li>
<li><strong>Fiche diagnostic électrique</strong> - Méthodes de contrôle</li>
</ul>

<h4>Feuillets Informatifs</h4>
<ul>
<li><strong>Feuillet public PROQUELEC</strong> - Version 2024 - Information générale</li>
<li><strong>Feuillet normes européennes</strong> - Adaptation aux standards internationaux</li>
<li><strong>Feuillet économie d''énergie</strong> - Solutions d''efficacité énergétique</li>
</ul>

<h4>Normes de Référence</h4>
<ul>
<li><strong>Normes de sécurité électrique 2024</strong> - Réglementation en vigueur</li>
<li><strong>Normes NF C 15-100</strong> - Installations domestiques</li>
<li><strong>Normes NFC 16-600</strong> - Installations industrielles</li>
</ul>

<h3>🗂️ Organisation des Documents</h3>

<p>Nos documents sont organisés par catégories pour faciliter votre recherche :</p>

<h4>📖 Guides et Manuels</h4>
<p>Documentation complète pour les professionnels : procédures, normes, bonnes pratiques.</p>

<h4>📄 Fiches Techniques</h4>
<p>Informations pratiques et opérationnelles pour votre quotidien professionnel.</p>

<h4>📋 Feuillets Informatifs</h4>
<p>Supports de communication et d''information générale sur nos services.</p>

<h4>⚖️ Normes de Référence</h4>
<p>Textes réglementaires et normes applicables aux installations électriques.</p>

<h3>📥 Téléchargement et Accès</h3>

<p>Tous nos documents sont disponibles en format PDF et peuvent être téléchargés gratuitement après inscription à notre espace professionnel.</p>

<h4>Fonctionnalités disponibles :</h4>
<ul>
<li>🔍 Recherche par mots-clés</li>
<li>🏷️ Filtrage par catégories</li>
<li>📊 Statistiques de téléchargement</li>
<li>⭐ Marquage des documents populaires</li>
<li>📅 Mise à jour régulière des contenus</li>
</ul>

<h3>📞 Support et Assistance</h3>

<p>Besoin d''un document spécifique ou d''assistance pour votre recherche ? Notre équipe est à votre disposition pour vous accompagner dans votre démarche.</p>

<p><strong>Contactez-nous</strong> pour toute demande particulière ou question relative à notre documentation technique.</p>',
  meta_description = 'Téléchargez nos documents techniques, guides professionnels et ressources pour les installations électriques. Bibliothèque complète PROQUELEC.',
  meta_keywords = 'documents PROQUELEC, guides électriques, normes sécurité, fiches techniques, téléchargement professionnel',
  hero_title = 'Documents & Ressources',
  hero_subtitle = 'Bibliothèque complète de documents techniques et professionnels'
WHERE slug = 'documents';
