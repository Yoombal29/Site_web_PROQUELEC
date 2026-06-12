/**
 * PROQUELEC API - Swagger Documentation
 * Complete API reference for all endpoints
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PROQUELEC API',
      version: '1.2.0',
      description: `
## API REST PROQUELEC - Documentation Complète

Cette API fournit l'accès à toutes les fonctionnalités backend de la plateforme PROQUELEC:

### Authentification
- **JWT Tokens** : Authentification sécurisée via JSON Web Tokens
- **RBAC** : Contrôle d'accès basé sur les rôles (admin, user, electricien, entreprise)

### Modules Disponibles
- 🔐 **Authentification** : Connexion, inscription, gestion de session
- 👥 **Utilisateurs** : Gestion des utilisateurs et rôles
- 📝 **Blog** : Articles, catégories, SEO
- 📄 **Pages CMS** : Pages dynamiques avec builder intégré
- 🏗️ **Builder** : God Builder / Craft.js pour la création de pages
- 💳 **Paiements** : Abonnements, plans, transactions PayDunya
- 📊 **Analytics** : Statistiques, métriques de performance
- 📧 **Newsletter** : Gestion des abonnés et campagnes
- 📁 **Média** : Upload et gestion des fichiers
- 🧠 **IA** : Intégration Google Gemini, génération de contenu
- 📋 **Inspections** : Checklists et rapports d'inspection électrique
- 🏆 **Certifications** : Labels et certifications électriques
- 📚 **Formations** : Catalogue de formations professionnelles
- ⚙️ **Administration** : Configuration globale du site
      `,
      contact: {
        name: 'PROQUELEC Sénégal',
        email: 'contact@proquelec.sn',
        url: 'https://proquelec.sn',
      },
      license: {
        name: 'Proprietary',
        url: 'https://proquelec.sn/terms',
      },
    },
    servers: [
      { url: 'https://proquelec.sn', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Développement' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /api/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: "ID unique de l'utilisateur" },
            email: { type: 'string', format: 'email', description: 'Adresse email' },
            name: { type: 'string', description: 'Nom complet' },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'electricien', 'entreprise'],
              description: "Rôle de l'utilisateur",
            },
            is_active: { type: 'boolean', description: 'Compte actif ou désactivé' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Page: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            structure_json: { type: 'object' },
            draft_json: { type: 'object' },
            is_published: { type: 'boolean' },
            meta_description: { type: 'string' },
            meta_keywords: { type: 'string' },
            hero_title: { type: 'string' },
            hero_subtitle: { type: 'string' },
            immutable: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            url: { type: 'string' },
            menu_type: { type: 'string', enum: ['main', 'footer'] },
            menu_order: { type: 'integer' },
            parent_id: { type: 'string', format: 'uuid', nullable: true },
            is_active: { type: 'boolean' },
            target: { type: 'string' },
            icon: { type: 'string' },
            label: { type: 'string' },
            linked_page_id: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        SubscriptionPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            duration_days: { type: 'integer' },
            features: { type: 'array', items: { type: 'string' } },
            is_premium: { type: 'boolean' },
            is_active: { type: 'boolean' },
          },
        },
        UserSubscription: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            plan_id: { type: 'string', format: 'uuid' },
            plan_name: { type: 'string' },
            end_date: { type: 'string', format: 'date-time' },
            payment_status: {
              type: 'string',
              enum: ['pending', 'active', 'expired', 'cancelled'],
            },
            is_active: { type: 'boolean' },
            manually_activated: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        BlogPost: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string' },
            cover_image_url: { type: 'string' },
            category_id: { type: 'string', format: 'uuid' },
            blog_categories: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
            published_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        BlogCategory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        MediaFile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            file_name: { type: 'string' },
            file_path: { type: 'string' },
            file_type: { type: 'string' },
            file_size: { type: 'integer' },
            mime_type: { type: 'string' },
            alt_text: { type: 'string' },
            category: { type: 'string' },
            uploaded_by: { type: 'string', format: 'uuid' },
            uploaded_at: { type: 'string', format: 'date-time' },
          },
        },
        ContactRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nom: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telephone: { type: 'string' },
            sujet: { type: 'string' },
            message: { type: 'string' },
            submitted_at: { type: 'string', format: 'date-time' },
          },
        },
        NewsletterSubscriber: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            source: { type: 'string' },
            is_active: { type: 'boolean' },
            subscribed_at: { type: 'string', format: 'date-time' },
          },
        },
        SiteSettings: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            site_name: { type: 'string' },
            slogan: { type: 'string' },
            logo_url: { type: 'string' },
            favicon_url: { type: 'string' },
            contact_email: { type: 'string' },
            phone_number: { type: 'string' },
            address: { type: 'string' },
            copyright_text: { type: 'string' },
            facebook_url: { type: 'string' },
            linkedin_url: { type: 'string' },
            twitter_url: { type: 'string' },
            cta_primary_text: { type: 'string' },
            cta_primary_url: { type: 'string' },
            cta_secondary_text: { type: 'string' },
            cta_secondary_url: { type: 'string' },
          },
        },
        ThemeSettings: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            primary_color: { type: 'string' },
            secondary_color: { type: 'string' },
            accent_color: { type: 'string' },
            background_color: { type: 'string' },
            text_color: { type: 'string' },
            font_family: { type: 'string' },
            footer_background_url: { type: 'string' },
          },
        },
        Inspection: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            project_title: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            checklist_data: { type: 'object' },
            report: { type: 'object' },
            score: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            installation_type: { type: 'string' },
            technical_info: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Certification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            certificate_number: { type: 'string' },
            holder_name: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            issued_at: { type: 'string', format: 'date-time' },
            expiry_date: { type: 'string', format: 'date' },
            metadata: { type: 'object' },
          },
        },
        Audit: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            site_name: { type: 'string' },
            location: { type: 'string' },
            inspector_id: { type: 'string', format: 'uuid' },
            findings: { type: 'object' },
            compliance_score: { type: 'number' },
            recommendations: { type: 'string' },
            audit_date: { type: 'string', format: 'date-time' },
          },
        },
        ProfessionalTraining: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            duration_hours: { type: 'integer' },
            level: { type: 'string' },
            price: { type: 'number' },
            max_participants: { type: 'integer' },
            instructor_name: { type: 'string' },
            location: { type: 'string' },
            equipment_provided: { type: 'string' },
            prerequisites: { type: 'string' },
            learning_objectives: { type: 'string' },
          },
        },
        ElectricalStandard: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            code: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            version: { type: 'string' },
            status: { type: 'string' },
            document_url: { type: 'string' },
            summary: { type: 'string' },
          },
        },
        Partner: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            logo_url: { type: 'string' },
            category: { type: 'string' },
            display_order: { type: 'integer' },
            is_active: { type: 'boolean' },
          },
        },
        Testimonial: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            role: { type: 'string' },
            content: { type: 'string' },
            rating: { type: 'integer' },
            avatar_url: { type: 'string' },
          },
        },
        QuickLink: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string' },
            icon_name: { type: 'string' },
            display_order: { type: 'integer' },
            is_active: { type: 'boolean' },
          },
        },
        PaymentSettings: {
          type: 'object',
          properties: {
            providers: {
              type: 'object',
              description: 'Configuration des providers de paiement',
            },
            default_provider: { type: 'string' },
            api_keys: {
              type: 'object',
              description: 'Clés API des providers de paiement',
            },
          },
        },
        PageTemplate: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            structure: { type: 'object' },
            theme_config: { type: 'object' },
            category: { type: 'string' },
            thumbnail: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        PageVersion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            page_id: { type: 'string', format: 'uuid' },
            version: { type: 'integer' },
            version_name: { type: 'string' },
            structure_json: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            created_by: { type: 'string', format: 'uuid' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: "Adresse email de l'utilisateur",
            },
            password: { type: 'string', format: 'password', description: 'Mot de passe' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            access_token: { type: 'string', description: 'Token JWT' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 6 },
            full_name: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            role: { type: 'string', enum: ['user', 'electricien', 'entreprise'] },
          },
        },
        HomeSlide: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            badge: { type: 'string' },
            title: { type: 'string' },
            subtitle: { type: 'string' },
            description: { type: 'string' },
            background_url: { type: 'string' },
            cta_text: { type: 'string' },
            cta_link: { type: 'string' },
            secondary_cta_text: { type: 'string' },
            secondary_cta_link: { type: 'string' },
            display_order: { type: 'integer' },
          },
        },
        HomeStat: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            label: { type: 'string' },
            value: { type: 'string' },
            icon_name: { type: 'string' },
            description: { type: 'string' },
            is_warning: { type: 'boolean' },
            display_order: { type: 'integer' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            target_role: { type: 'string' },
            created_by: { type: 'string', format: 'uuid' },
            read: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            date: { type: 'string', format: 'date' },
            location: { type: 'string' },
            details: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        SiteAsset: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            asset_type: { type: 'string' },
            file_url: { type: 'string' },
            is_premium: { type: 'boolean' },
            price_fcfy: { type: 'number' },
            download_stats: { type: 'integer' },
          },
        },
        TechTool: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            route: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            is_paid: { type: 'boolean' },
            price: { type: 'number' },
            is_active: { type: 'boolean' },
          },
        },
        GEDWorkflowConfig: {
          type: 'object',
          properties: {
            states: { type: 'array', items: { type: 'string' } },
            transitions: { type: 'object' },
            entities: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    tags: [
      { name: 'Authentification', description: 'Connexion, inscription, profil utilisateur' },
      { name: 'Utilisateurs', description: 'Gestion des utilisateurs (admin)' },
      { name: 'Pages', description: 'Pages CMS publiques et administrateur' },
      { name: 'Menu', description: 'Gestion du menu de navigation' },
      { name: 'Blog', description: 'Articles et catégories du blog' },
      { name: 'Paiements', description: 'Abonnements, plans et transactions' },
      { name: 'Administration', description: 'Administration générale du site' },
      { name: 'Builder', description: 'God Builder / Craft.js - Composants et templates' },
      { name: 'Média', description: 'Upload, stockage et gestion des fichiers' },
      { name: 'Newsletter', description: 'Inscription, désabonnement et campagnes' },
      { name: 'Contact', description: 'Formulaire de contact et demandes' },
      {
        name: 'IA',
        description: 'Intelligence Artificielle - Gemini, génération de contenu et code',
      },
      { name: 'Inspections', description: "Checklists et rapports d'inspection électrique" },
      { name: 'Certifications', description: 'Labels et certifications électriques' },
      { name: 'Formations', description: 'Catalogue de formations professionnelles' },
      { name: 'Événements', description: 'Gestion des événements' },
      { name: 'Normes', description: 'Normes et équipements électriques' },
      { name: 'Partenaires', description: 'Gestion des partenaires et témoignages' },
      { name: 'Analytics', description: 'Statistiques et métriques de performance' },
      { name: 'Santé', description: 'État du serveur et diagnostics' },
      { name: 'Observatoire', description: 'Suivi et traitement Inspection Cossuel (ST) - Données régionales' },
      { name: 'Email', description: 'Envoi demails templates' },
      { name: 'CMS', description: 'Plugins et thèmes CMS' },
      { name: 'GED', description: 'Gestion Électronique de Documents - Workflow' },
      { name: 'Recherche', description: 'Recherche full-text sur le site' },
      { name: 'Notifications', description: 'Notifications push et in-app' },
      { name: 'Chat', description: 'Conversations IA et historique' },
    ],
  },
  apis: ['./index.js', './modules/**/*.routes.js', './routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
