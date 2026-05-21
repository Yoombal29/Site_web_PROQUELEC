

export const demoCourse: Course = {
  id: 'demo-course',
  title: 'Formation Démo - Découverte du Mode Présentation',
  modules: [
  {
    id: 'mod-intro',
    title: 'Introduction au mode présentation',
    prerequisites: [],
    knowledge: ['Comprendre l\'interface de présentation', 'Connaître les outils disponibles'],
    skills: ['Navigation fluide', 'Utilisation des raccourcis'],
    duration: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mod-tools',
    title: 'Outils interactifs',
    prerequisites: ['mod-intro'],
    knowledge: ['Annotations et dessins', 'Pointeur laser', 'Notes du présentateur'],
    skills: ['Annoter en temps réel', 'Utiliser le laser efficacement'],
    duration: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mod-themes',
    title: 'Thèmes et transitions',
    prerequisites: ['mod-intro'],
    knowledge: ['6 thèmes visuels', '6 types de transitions'],
    skills: ['Personnaliser l\'apparence', 'Choisir les bonnes transitions'],
    duration: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }],

  documents: [],
  content: {
    introduction: `Bienvenue dans cette démonstration interactive du mode présentation !

Cette formation vous permettra de découvrir toutes les fonctionnalités avancées de notre système de présentation professionnelle, inspiré des meilleurs outils comme PowerPoint.

**Ce que vous allez apprendre :**
- Navigation intuitive par clavier et souris
- Utilisation des outils d'annotation en temps réel
- Configuration des thèmes et transitions
- Fonctionnalités avancées pour les présentateurs

Appuyez sur les flèches ou cliquez pour naviguer entre les diapositives.`,

    sections: [
    {
      id: 'section-navigation',
      title: 'Navigation et raccourcis clavier',
      explanation: `Le mode présentation offre une navigation complète au clavier pour une expérience fluide et professionnelle.

**Raccourcis essentiels :**
- **← →** : Naviguer entre les diapositives
- **F** : Basculer en mode plein écran
- **Échap** : Quitter le plein écran ou fermer les panneaux
- **G** : Ouvrir la grille de navigation avec recherche
- **T** : Afficher/masquer la barre latérale de miniatures

La grille de navigation vous permet de sauter directement à n'importe quelle diapositive et inclut une fonction de recherche pour trouver rapidement du contenu.`,
      examples: [
      '→ : Diapositive suivante',
      '← : Diapositive précédente',
      'F : Mode plein écran',
      'G : Grille de navigation',
      'T : Miniatures latérales'],

      warnings: [
      'Appuyez sur Échap pour quitter le mode plein écran',
      'Certains navigateurs peuvent bloquer le plein écran - autorisez-le si demandé']

    },
    {
      id: 'section-laser',
      title: 'Pointeur laser virtuel',
      explanation: `Le pointeur laser est un outil essentiel pour guider l'attention de votre audience sur des éléments spécifiques.

**Activation :**
Appuyez sur **L** pour activer/désactiver le pointeur laser. Un point rouge lumineux suivra votre curseur avec un effet de traînée élégant.

**Caractéristiques :**
- Point lumineux rouge visible sur tous les fonds
- Effet de traînée pour une meilleure visibilité
- Se désactive automatiquement quand vous utilisez d'autres outils

Le laser est particulièrement utile pour les présentations à distance où vous ne pouvez pas pointer physiquement l'écran.`,
      examples: [
      'L : Activer/désactiver le laser',
      'Déplacez la souris pour pointer',
      'Le laser fonctionne même en plein écran'],

      warnings: [
      'Le laser se désactive quand vous activez le mode dessin',
      'Évitez de bouger trop vite pour que l\'audience puisse suivre']

    },
    {
      id: 'section-drawing',
      title: 'Outils d\'annotation',
      explanation: `Les outils d'annotation vous permettent de dessiner directement sur vos diapositives pendant la présentation.

**Outils disponibles :**
- **Stylo** : Trait fin pour écrire et souligner
- **Surligneur** : Trait semi-transparent pour mettre en évidence
- **Gomme** : Effacer vos annotations

**Activation :**
Appuyez sur **D** pour ouvrir la barre d'outils de dessin. Vous pouvez choisir l'outil, la couleur et l'épaisseur du trait.

Toutes vos annotations sont temporaires et disparaissent quand vous quittez le mode présentation.`,
      examples: [
      'D : Ouvrir/fermer les outils de dessin',
      'Cliquez et glissez pour dessiner',
      'Sélectionnez une couleur dans la palette'],

      warnings: [
      'Les annotations ne sont pas sauvegardées',
      'Utilisez la gomme ou le bouton "Effacer" pour nettoyer']

    },
    {
      id: 'section-notes',
      title: 'Notes du présentateur',
      explanation: `Les notes du présentateur vous permettent d'avoir des aide-mémoire invisibles pour votre audience.

**Activation :**
Appuyez sur **N** pour afficher le panneau de notes du présentateur en bas de l'écran.

**Contenu du panneau :**
- Notes de la diapositive actuelle
- Aperçu de la diapositive suivante
- Timer de présentation
- Numéro de diapositive actuelle

Les notes sont parfaites pour garder une trace de vos points de discussion sans surcharger vos diapositives.`,
      examples: [
      'N : Afficher/masquer les notes',
      'Les notes n\'apparaissent que pour vous',
      'Utilisez-les pour vos points clés'],

      warnings: [
      'En mode projection, assurez-vous que l\'écran des notes n\'est pas visible par l\'audience']

    },
    {
      id: 'section-themes',
      title: 'Thèmes visuels',
      explanation: `Le mode présentation propose 6 thèmes visuels distincts pour personnaliser l'apparence de votre présentation.

**Thèmes disponibles :**
1. **Corporate** : Bleu professionnel, idéal pour les entreprises
2. **Creative** : Dégradé violet/rose, parfait pour les projets créatifs
3. **Minimal** : Noir et blanc épuré, focus sur le contenu
4. **Nature** : Tons verts, pour les sujets environnementaux
5. **Tech** : Cyan et sombre, style high-tech
6. **Warm** : Orange chaleureux, pour les présentations conviviales

Chaque thème ajuste automatiquement les couleurs, les polices et les éléments visuels pour une cohérence parfaite.`,
      examples: [
      'Corporate : Tons bleus professionnels',
      'Minimal : Design épuré noir/blanc',
      'Tech : Style moderne cyberpunk'],

      warnings: [
      'Choisissez un thème adapté à votre contexte',
      'Testez la lisibilité sur l\'écran de projection']

    },
    {
      id: 'section-transitions',
      title: 'Effets de transition',
      explanation: `Les transitions animent le passage d'une diapositive à l'autre pour une présentation dynamique.

**Transitions disponibles :**
1. **Fade** : Fondu doux et professionnel
2. **Slide** : Glissement horizontal classique
3. **Zoom** : Effet de zoom avant/arrière
4. **Flip** : Rotation 3D comme une page
5. **Cube** : Rotation en cube 3D
6. **None** : Changement instantané

Vous pouvez changer la transition à tout moment via la barre d'outils.`,
      examples: [
      'Fade : Transition douce recommandée',
      'Cube : Effet 3D impressionnant',
      'Slide : Classique et efficace'],

      warnings: [
      'Évitez les transitions trop flashy pour les présentations formelles',
      'Une transition cohérente tout au long est plus professionnelle']

    },
    {
      id: 'section-autoplay',
      title: 'Mode lecture automatique',
      explanation: `Le mode lecture automatique fait défiler vos diapositives automatiquement à un intervalle défini.

**Fonctionnalités :**
- Vitesse réglable (5s, 10s, 15s, 30s entre les diapositives)
- Pause/reprise à tout moment
- Parfait pour les kiosques et affichages

Pour activer la lecture automatique, cliquez sur le bouton ▶️ dans la barre d'outils et sélectionnez l'intervalle souhaité.`,
      examples: [
      '5s : Défilement rapide pour les aperçus',
      '15s : Rythme normal de lecture',
      '30s : Temps pour des diapositives complexes'],

      warnings: [
      'La lecture auto s\'arrête quand vous naviguez manuellement',
      'Ajustez le timing selon la complexité de chaque slide']

    }],


    qcm: [
    {
      id: 'qcm-1',
      question: 'Quel raccourci clavier active le pointeur laser ?',
      options: ['L', 'P', 'D', 'F'],
      correctAnswer: 0,
      explanation: 'La touche L (pour Laser) active le pointeur laser virtuel.'
    },
    {
      id: 'qcm-2',
      question: 'Quel raccourci ouvre la grille de navigation ?',
      options: ['N', 'T', 'G', 'F'],
      correctAnswer: 2,
      explanation: 'La touche G (pour Grid) ouvre la grille de navigation avec recherche.'
    },
    {
      id: 'qcm-3',
      question: 'Comment active-t-on le mode plein écran ?',
      options: ['Touche Entrée', 'Touche F', 'Double-clic', 'Touche Espace'],
      correctAnswer: 1,
      explanation: 'La touche F (pour Fullscreen) bascule le mode plein écran.'
    },
    {
      id: 'qcm-4',
      question: 'Combien de thèmes visuels sont disponibles ?',
      options: ['4', '5', '6', '8'],
      correctAnswer: 2,
      explanation: 'Le mode présentation propose 6 thèmes : Corporate, Creative, Minimal, Nature, Tech et Warm.'
    },
    {
      id: 'qcm-5',
      question: 'Quel raccourci affiche les notes du présentateur ?',
      options: ['N', 'P', 'O', 'S'],
      correctAnswer: 0,
      explanation: 'La touche N (pour Notes) affiche le panneau de notes du présentateur.'
    }],


    conclusion: `Félicitations ! Vous maîtrisez maintenant toutes les fonctionnalités du mode présentation.

**Récapitulatif des raccourcis :**
| Touche | Action |
|--------|--------|
| ← → | Navigation |
| F | Plein écran |
| L | Laser |
| D | Dessin |
| G | Grille |
| N | Notes |
| T | Miniatures |

Vous êtes prêt à créer des présentations professionnelles et interactives !

N'hésitez pas à explorer les différents thèmes et transitions pour trouver le style qui correspond le mieux à votre contenu.`,

    resources: [
    'Guide des raccourcis clavier (F1)',
    'Documentation complète en ligne',
    'Tutoriels vidéo sur YouTube',
    'Forum de support communautaire']

  },
  generatedAt: new Date(),
  lastModified: new Date()
};