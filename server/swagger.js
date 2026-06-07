/**
 * Swagger UI setup for PROQUELEC API
 * Uses the comprehensive spec from swagger-docs.js
 */
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-docs');

function setupSwagger(app) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss:
        '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #2376df }',
      customSiteTitle: 'PROQUELEC API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    }),
  );

  // Serve raw swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('[SWAGGER] API docs available at /api-docs');
}

// Export both for compatibility
module.exports = swaggerSpec;
module.exports.setupSwagger = setupSwagger;
