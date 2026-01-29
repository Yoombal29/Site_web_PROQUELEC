import React from "react";

const features = [
  {
    title: "Accueil (Home)",
    description: "Page d'accueil du site, vitrine principale, met en avant les nouveautés, partenaires, actualités, etc.",
    configuration: "Personnalisez le contenu via le module Pages ou directement dans le composant Home. Les blocs sont dynamiques et peuvent être réorganisés par l'admin."
  },
  {
    title: "Recherche globale et avancée",
    description: "Recherche rapide et filtrée sur tous les contenus du site (documents, articles, événements, etc.)",
    configuration: "Aucune configuration nécessaire. Les champs de recherche sont présents sur la page d'accueil et dans le dashboard. Les résultats dépendent des données indexées."
  },
  {
    title: "Blog / Actualités",
    description: "Publication d'articles, gestion des catégories, pagination, recherche, édition/suppression par l'admin.",
    configuration: "Gérez les articles et catégories dans la rubrique Blog du dashboard. Utilisez le module AdminBlogPanel pour ajouter, éditer ou supprimer des articles."
  },
  {
    title: "Événements",
    description: "Affichage et gestion des événements à venir ou passés.",
    configuration: "Ajoutez/modifiez/supprimez des événements dans la rubrique Événements du dashboard."
  },
  {
    title: "Documents à télécharger",
    description: "Mise à disposition de documents téléchargeables, gestion sécurisée via Supabase Storage.",
    configuration: "Ajoutez des documents dans la rubrique Documents du dashboard. Les liens de téléchargement sont générés automatiquement (URL signée)."
  },
  {
    title: "Médiathèque (Images, Galerie, Vidéos)",
    description: "Stockage, organisation et affichage des médias.",
    configuration: "Gérez les images, galeries et vidéos dans les rubriques Images, Galerie, Médiathèque du dashboard. Upload via Supabase Storage."
  },
  {
    title: "Boutons de téléchargement configurables",
    description: "Créez des boutons de téléchargement personnalisés (titre, couleur, fichier cible, etc.) depuis le dashboard.",
    configuration: "Utilisez la rubrique Boutons de téléchargement dans Médias. Ajoutez/éditez/supprimez les boutons, configurez chaque paramètre."
  },
  {
    title: "Newsletter",
    description: "Collecte d'emails, gestion des abonnés, envoi de campagnes.",
    configuration: "Configurez la newsletter dans la rubrique Newsletter du dashboard. Ajoutez des campagnes, gérez les abonnés."
  },
  {
    title: "Gestion des utilisateurs",
    description: "Inscription, connexion, gestion des profils et des rôles.",
    configuration: "Gérez les utilisateurs dans la rubrique Utilisateurs du dashboard. Attribuez les rôles, modifiez les profils."
  },
  {
    title: "Gestion des pages",
    description: "Création, édition, suppression de pages de contenu.",
    configuration: "Utilisez la rubrique Pages du dashboard pour gérer toutes les pages du site."
  },
  {
    title: "Gestion du menu",
    description: "Organisation des menus de navigation.",
    configuration: "Configurez les menus dans la rubrique Menus du dashboard. Glissez-déposez pour réorganiser."
  },
  {
    title: "Gestion des catégories",
    description: "Catégorisation des articles, documents, événements, etc.",
    configuration: "Ajoutez/éditez/supprimez les catégories dans la rubrique Blog ou Documents selon le type."
  },
  {
    title: "Gestion des formations professionnelles",
    description: "Ajout, modification, suppression de formations, inscription des utilisateurs.",
    configuration: "Gérez les formations dans la rubrique Formations du dashboard."
  },
  {
    title: "Certifications et normes",
    description: "Base de données des certifications et normes électriques.",
    configuration: "Ajoutez/modifiez les certifications et normes dans la rubrique Certifications ou Normes du dashboard."
  },
  {
    title: "Mode construction",
    description: "Permet de mettre le site en maintenance pour les visiteurs.",
    configuration: "Activez/désactivez le mode construction dans la rubrique Construction du dashboard."
  },
  {
    title: "Thème et apparence",
    description: "Personnalisation des couleurs, thèmes, apparence générale.",
    configuration: "Modifiez le thème dans la rubrique Thème du dashboard. Choisissez couleurs, polices, etc."
  },
  {
    title: "Statistiques et analytics",
    description: "Suivi des visites, téléchargements, interactions.",
    configuration: "Consultez les statistiques dans la rubrique Analytics du dashboard."
  },
  {
    title: "Performance et logs",
    description: "Suivi des performances, accès aux logs et audit trail.",
    configuration: "Accédez aux logs et à la performance dans les rubriques Performance et Audit du dashboard."
  },
  {
    title: "Sécurité",
    description: "Gestion des accès, droits, politiques RLS Supabase, téléchargements sécurisés.",
    configuration: "Configurez les droits dans la rubrique Sécurité du dashboard. Les politiques RLS sont gérées côté Supabase."
  },
  {
    title: "Notifications et centre de notifications",
    description: "Système de notifications pour informer les utilisateurs/admins.",
    configuration: "Configurez les notifications dans la rubrique Notifications du dashboard."
  },
  {
    title: "Chat en direct (LiveChat)",
    description: "Support ou assistance en temps réel pour les visiteurs.",
    configuration: "Activez/désactivez le chat dans la configuration générale ou le composant LiveChat."
  }
];

export default function DashboardFeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-proqblue">Fonctionnalités du site & configuration</h1>
      <ul className="space-y-8">
        {features.map((f, i) => (
          <li key={i} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-proqblue mb-2">{f.title}</h2>
            <p className="mb-2 text-gray-700">{f.description}</p>
            <div className="text-sm text-gray-500"><b>Configuration&nbsp;:</b> {f.configuration}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
