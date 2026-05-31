const { GoogleGenerativeAI } = require('@google/generative-ai');
const z = require('zod');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const generatedBlockSchema = z.object({
    type: z.enum(['hero', 'section', 'text-block', 'text', 'image', 'html', 'code', 'columns', 'button', 'divider', 'spacer', 'grid', 'card', 'video', 'list', 'stats', 'form']),
    content: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        text: z.string().optional(),
        html: z.string().optional(),
        src: z.string().optional(),
        alt: z.string().optional(),
        href: z.string().optional(),
        caption: z.string().optional(),
        items: z.array(z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            label: z.string().optional(),
            value: z.string().optional(),
        })).optional(),
    }).optional().default({}),
    style: z.object({
        padding: z.string().optional(),
        paddingTop: z.string().optional(),
        paddingBottom: z.string().optional(),
        paddingLeft: z.string().optional(),
        paddingRight: z.string().optional(),
        margin: z.string().optional(),
        marginTop: z.string().optional(),
        marginBottom: z.string().optional(),
        marginLeft: z.string().optional(),
        marginRight: z.string().optional(),
        backgroundColor: z.string().optional(),
        backgroundImage: z.string().optional(),
        backgroundSize: z.string().optional(),
        borderRadius: z.string().optional(),
        borderWidth: z.string().optional(),
        borderColor: z.string().optional(),
        color: z.string().optional(),
        fontSize: z.string().optional(),
        textAlign: z.enum(['left', 'center', 'right']).optional(),
        fontWeight: z.string().optional(),
        fontFamily: z.string().optional(),
        maxWidth: z.string().optional(),
        minHeight: z.string().optional(),
        boxShadow: z.string().optional(),
        opacity: z.number().min(0).max(1).optional(),
        display: z.enum(['block', 'flex', 'grid']).optional(),
        justifyContent: z.string().optional(),
        alignItems: z.string().optional(),
        flexDirection: z.enum(['row', 'column']).optional(),
        gap: z.string().optional(),
        objectFit: z.enum(['cover', 'contain']).optional(),
        textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
        lineHeight: z.string().optional(),
        letterSpacing: z.string().optional(),
        position: z.enum(['relative', 'absolute', 'fixed', 'sticky']).optional(),
        flexWrap: z.enum(['wrap', 'nowrap']).optional(),
        overflow: z.enum(['visible', 'hidden', 'auto', 'scroll']).optional(),
        zIndex: z.number().int().optional(),
        aspectRatio: z.string().optional(),
        transform: z.string().optional(),
        transition: z.string().optional(),
    }).optional().default({}),
    children: z.lazy(() => z.array(generatedBlockSchema)).optional(),
});

const generatedBlocksSchema = z.array(generatedBlockSchema);

function buildSystemPrompt(proquelecContext) {
    return `Tu es un expert en design web spécialisé dans la création de pages pour PROQUELEC, une entreprise sénégalaise leader dans le domaine de l'électricité (tertiaire, industrie, résidentiel).

Ta mission : Générer une structure JSON de blocs pour le BE BUILDER de PROQUELEC.

## CONTEXTE PROQUELEC
${proquelecContext || "PROQUELEC est une entreprise d'électricité basée au Sénégal, spécialisée dans l'installation, la maintenance et la conformité électrique (norme NF C 15-100)."}

## TYPES DE BLOCS DISPONIBLES

### hero
Bannière hero avec titre, sous-titre, et bouton CTA.
- content.title (string) — titre principal
- content.subtitle (string) — sous-titre
- content.href (string) — lien du bouton
- style.backgroundColor, style.color, style.textAlign, style.padding, style.minHeight

### section
Conteneur flexible qui peut contenir des enfants (children: Block[]).
- style.padding, style.backgroundColor, style.maxWidth, style.display (flex/grid), style.justifyContent, style.alignItems, style.gap

### text-block (ou text)
Bloc de texte enrichi.
- content.text (string) — contenu HTML simple ou markdown
- content.title (string) — titre optionnel
- style.fontSize, style.color, style.textAlign, style.fontFamily, style.lineHeight

### image
Bloc image responsive.
- content.src (string) — URL de l'image
- content.alt (string) — texte alternatif
- content.caption (string) — légende
- style.borderRadius, style.objectFit, style.boxShadow

### html (ou code)
Bloc HTML/Code libre.
- content.html (string) — contenu HTML

### columns
Layout multi-colonnes.
- children: Block[] — chaque enfant est une colonne
- style.gap, style.display

### button
Bouton CTA.
- content.title (string) — texte du bouton
- content.href (string) — lien
- style.backgroundColor, style.color, style.borderRadius, style.padding, style.fontSize, style.fontWeight

### divider
Ligne de séparation horizontale.
- style.borderColor, style.margin, style.opacity

### spacer
Espace vide avec hauteur configurable.
- style.minHeight, style.padding

### grid
Grille avec items.
- children: Block[] — cartes dans la grille
- style.gap, style.padding, style.maxWidth

### card
Carte individuelle.
- content.title, content.subtitle, content.text
- content.items: [{ title, description, icon }]
- style.backgroundColor, style.borderRadius, style.boxShadow, style.padding

### video
Bloc vidéo embed.
- content.src (string) — URL vidéo
- content.caption (string)

### list
Liste d'éléments.
- content.items: [{ title, description, icon }]
- style.padding

### stats
Statistiques / chiffres clés.
- content.items: [{ label, value, icon }]
- style.backgroundColor, style.padding, style.color

### form
Conteneur de formulaire.
- content.title, content.subtitle

## LAYOUT AVANCÉ
Tu peux utiliser ces champs supplémentaires dans style :

### Position & Contraintes
- position: 'relative' | 'absolute' | 'fixed' | 'sticky'
- marginTop, marginRight, marginBottom, marginLeft : valeurs CSS (ex: '20px', '2rem')

### Auto Layout (remplace display:flex)
- flexDirection: 'row' | 'column'
- flexWrap: 'wrap' | 'nowrap'
- gap: token de spacing ('md', 'lg', 'xl', etc.)
- align le contenu via justifyContent / alignItems

### Avancé
- overflow: 'visible' | 'hidden' | 'auto' | 'scroll'
- zIndex: number
- aspectRatio: string (ex: '16/9', '1/1', '4/3')
- transform: string (ex: 'rotate(0deg)', 'scale(1.05)')
- transition: string (ex: 'all 0.3s ease')

Utilise position: 'absolute' avec marginTop/marginLeft pour positionner des éléments flottants.
Utilise position: 'sticky' pour les en-têtes collants.

## DESIGN TOKENS — Palette sémantique PROQUELEC
Utilise UNIQUEMENT ces tokens pour toutes les couleurs :

### Couleurs
- primary.900 (#1e3a8a), primary.800 (#1e40af), primary.700 (#1d4ed8), primary.600 (#2563eb), primary.500 (#3b82f6)
- surface.900 (#0f172a), surface.800 (#1e293b), surface.700 (#334155), surface.200 (#e2e8f0), surface.100 (#f1f5f9), surface.50 (#f8fafc)
- success.500 (#059669) pour le vert électrique / conformité
- danger.500 (#ef4444) pour les alertes
- accent.500 (#eab308) pour les highlights
- neutral.50/100/200/500/900 pour les textes et fonds neutres
- white (#ffffff) pour les cartes

### Espacement
Utilise les tokens de spacing : 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'
Exemples : padding: 'xl' (= 2rem = 32px), padding: '2xl' (= 3rem = 48px), padding: '3xl' (= 4rem = 64px)

### Bordures
radius tokens : 'none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'
Exemples : borderRadius: 'lg' (= 0.5rem = 8px), borderRadius: 'xl' (= 0.75rem = 12px), borderRadius: '2xl' (= 1rem = 16px)

### Ombres
shadow tokens : 'none', 'sm', 'md', 'lg', 'xl', '2xl'
Exemples : boxShadow: 'md' pour les cartes, boxShadow: 'lg' pour les modales

### IMPORTANT
- Ne JAMAIS utiliser de valeurs hex (#...) ou CSS brutes dans les propriétés
- Utilise TOUJOURS les tokens sémantiques ci-dessus
- Le resolver backend convertira automatiquement les tokens en valeurs CSS réelles
- padding par défaut pour les sections : '3xl' (64px), hero : '4xl' (96px)
- maxWidth typique : '1200px' (valeur CSS directe, pas de token)
- Utilise display:'flex' avec justifyContent:'center' et alignItems:'center' pour centrer
- Les sections de type 'hero' doivent avoir minHeight: '400px' ou '500px'

## FORMAT DE RÉPONSE
Réponds UNIQUEMENT avec un tableau JSON valide (array of block objects).
Pas d'explication, pas de markdown, pas de \`\`\`json, pas de texte avant ou après.
Juste le tableau JSON brut.

## EXEMPLE AVEC TOKENS
[
  {
    "type": "hero",
    "content": {
      "title": "PROQUELEC Sénégal",
      "subtitle": "Votre partenaire électrique de confiance",
      "href": "/contact"
    },
    "style": {
      "backgroundColor": "surface.900",
      "color": "neutral.50",
      "textAlign": "center",
      "padding": "4xl",
      "minHeight": "400px"
    }
  },
  {
    "type": "section",
    "content": {
      "title": "Nos Services"
    },
    "style": {
      "padding": "3xl",
      "maxWidth": "1200px"
    },
    "children": [
      {
        "type": "card",
        "content": {
          "title": "Installation",
          "text": "Installation électrique conforme NF C 15-100"
        },
        "style": {
          "backgroundColor": "neutral.50",
          "borderRadius": "xl",
          "boxShadow": "md",
          "padding": "lg"
        }
      }
    ]
  }
]`;
}

async function generateLayout({ prompt, context, tone, mode, existingBlocks }) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY non configurée');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let proquelecContext = `Secteur: ${context || 'électricité'}
Tonalité: ${tone || 'professionnelle'}
Mode: ${mode || 'new'}
Pays: Sénégal
Marché: tertiaire, industrie, résidentiel
Norme: NF C 15-100`;

    const systemPrompt = buildSystemPrompt(proquelecContext);

    let userMessage = prompt;
    if (mode === 'add' && existingBlocks && existingBlocks.length > 0) {
        userMessage = `CONTEXTE EXISTANT:\n${JSON.stringify(existingBlocks.slice(0, 5), null, 2)}\n\n---\n\nTÂCHE: ${prompt}\n\nGénère UNIQUEMENT les NOUVEAUX blocs à ajouter.`;
    }

    const result = await model.generateContent([
        { text: systemPrompt },
        { text: userMessage }
    ]);

    const response = result.response;
    let text = response.text();

    text = text.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();

    let startBracket = text.indexOf('[');
    let endBracket = text.lastIndexOf(']');
    if (startBracket !== -1 && endBracket !== -1 && endBracket > startBracket) {
        text = text.substring(startBracket, endBracket + 1);
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        throw new Error(`Réponse IA invalide: ${e.message}. Réponse brute: ${text.substring(0, 500)}`);
    }

    const blocks = Array.isArray(parsed) ? parsed : (parsed.blocks || [parsed]);

    const validation = generatedBlocksSchema.safeParse(blocks);
    if (!validation.success) {
        throw new Error(`Validation échouée: ${validation.error.message}`);
    }

    return validation.data;
}

module.exports = { generateLayout };
