/**
 * Swagger API Documentation Configuration
 * PROQUELEC Enterprise Backend
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PROQUELEC Enterprise API',
            version: '1.2.0',
            description: `
## API REST PROQUELEC - Documentation Complète

Cette API fournit l'accès à toutes les fonctionnalités backend de la plateforme PROQUELEC:

### Authentification
- **JWT Tokens** : Authentification sécurisée via JSON Web Tokens
- **RBAC** : Contrôle d'accès basé sur les rôles (admin, partner, user)

### Modules Disponibles
- 🔐 **Auth** : Connexion, inscription, gestion de session
- 👥 **Users** : Gestion des utilisateurs et rôles
- 📝 **Blog** : Articles, catégories, SEO
- 📅 **Events** : Événements et inscriptions
- 📄 **Documents** : Téléchargements sécurisés
- 🏆 **Certifications** : Labels et certifications
- 📚 **Formations** : Catalogue de formations
- ⚙️ **Settings** : Configuration globale du site
- 📊 **Analytics** : Statistiques et métriques
      `,
            contact: {
                name: 'PROQUELEC Sénégal',
                email: 'contact@proquelec.sn',
                url: 'https://proquelec.sn'
            },
            license: {
                name: 'Proprietary',
                url: 'https://proquelec.sn/terms'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur de développement'
            },
            {
                url: 'https://api.proquelec.sn',
                description: 'Serveur de production'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre token JWT obtenu via /api/auth/login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID unique de l\'utilisateur' },
                        email: { type: 'string', format: 'email', description: 'Adresse email' },
                        role: { type: 'string', enum: ['admin', 'partner', 'user'], description: 'Rôle de l\'utilisateur' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        slug: { type: 'string' },
                        content: { type: 'string' },
                        excerpt: { type: 'string' },
                        category_id: { type: 'integer' },
                        image_url: { type: 'string' },
                        is_published: { type: 'boolean' },
                        views: { type: 'integer' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        location: { type: 'string' },
                        capacity: { type: 'integer' },
                        image_url: { type: 'string' }
                    }
                },
                Document: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        file_url: { type: 'string' },
                        category: { type: 'string' },
                        download_count: { type: 'integer' }
                    }
                },
                Certification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        criteria: { type: 'string' },
                        badge_image: { type: 'string' }
                    }
                },
                Formation: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        duration_hours: { type: 'integer' },
                        price: { type: 'number' },
                        max_participants: { type: 'integer' }
                    }
                },
                Settings: {
                    type: 'object',
                    properties: {
                        site_name: { type: 'string' },
                        slogan: { type: 'string' },
                        primary_color: { type: 'string' },
                        logo_url: { type: 'string' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentification et gestion de session' },
            { name: 'Users', description: 'Gestion des utilisateurs' },
            { name: 'Blog', description: 'Articles et catégories' },
            { name: 'Events', description: 'Événements et inscriptions' },
            { name: 'Documents', description: 'Gestion documentaire' },
            { name: 'Certifications', description: 'Labels et certifications' },
            { name: 'Formations', description: 'Catalogue de formations' },
            { name: 'Settings', description: 'Configuration du site' },
            { name: 'Health', description: 'État du serveur et diagnostics' }
        ]
    },
    apis: ['./index.js', './routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
