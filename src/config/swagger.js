// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion de Tournois E-sport',
      version: '1.0.0',
      description: `
        API REST complète pour gérer des tournois e-sport avec :
        - 🔐 Authentification JWT
        - 🏆 Gestion de tournois
        - 👥 Gestion d'équipes
        - 📝 Système d'inscriptions
        - ⚔️ Gestion de matchs
      `,
      contact: {
        name: 'Support API',
        email: 'support@esports-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT (obtenu via /api/auth/login)'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
              example: 'user@example.com'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 20,
              description: 'Nom d\'utilisateur (3-20 caractères)',
              example: 'player123'
            },
            role: {
              type: 'string',
              enum: ['PLAYER', 'ORGANIZER', 'ADMIN'],
              description: 'Rôle de l\'utilisateur',
              example: 'PLAYER'
            },
            teamId: {
              type: 'integer',
              nullable: true,
              description: 'ID de l\'équipe (si membre)',
              example: null
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            }
          }
        },
        Tournament: {
          type: 'object',
          required: ['name', 'game', 'startDate', 'endDate', 'maxTeams', 'prizePool'],
          properties: {
            id: { 
              type: 'integer', 
              example: 1,
              description: 'ID unique du tournoi'
            },
            name: { 
              type: 'string', 
              example: 'World Championship 2024',
              description: 'Nom du tournoi'
            },
            game: { 
              type: 'string', 
              example: 'League of Legends',
              description: 'Jeu concerné'
            },
            description: { 
              type: 'string', 
              example: 'Tournoi international avec les meilleures équipes',
              description: 'Description du tournoi'
            },
            startDate: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-06-15T09:00:00Z',
              description: 'Date de début'
            },
            endDate: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-06-20T18:00:00Z',
              description: 'Date de fin'
            },
            maxTeams: { 
              type: 'integer', 
              example: 16,
              minimum: 2,
              description: 'Nombre maximum d\'équipes'
            },
            prizePool: { 
              type: 'number', 
              format: 'decimal',
              example: 50000.00,
              description: 'Dotation totale'
            },
            rules: { 
              type: 'string', 
              example: 'Format BO3, draft mode standard',
              description: 'Règles du tournoi'
            },
            status: { 
              type: 'string', 
              enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
              example: 'UPCOMING',
              description: 'Statut du tournoi'
            },
            organizerId: { 
              type: 'integer', 
              example: 5,
              description: 'ID de l\'organisateur'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Date de création'
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        Team: {
          type: 'object',
          required: ['name', 'tag'],
          properties: {
            id: { 
              type: 'integer', 
              example: 1,
              description: 'ID unique de l\'équipe'
            },
            name: { 
              type: 'string', 
              example: 'Team Alpha',
              description: 'Nom de l\'équipe'
            },
            tag: { 
              type: 'string', 
              example: 'ALPH',
              minLength: 2,
              maxLength: 5,
              description: 'Tag court de l\'équipe (2-5 caractères)'
            },
            captainId: { 
              type: 'integer', 
              example: 5,
              description: 'ID du capitaine'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Date de création'
            }
          }
        },
        Registration: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer', 
              example: 1 
            },
            tournamentId: { 
              type: 'integer', 
              example: 5 
            },
            teamId: { 
              type: 'integer', 
              example: 3 
            },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'APPROVED' 
            },
            registeredAt: { 
              type: 'string', 
              format: 'date-time' 
            }
          }
        },
        Match: {
          type: 'object',
          properties: {
            id: { 
              type: 'integer', 
              example: 1 
            },
            tournamentId: { 
              type: 'integer', 
              example: 5 
            },
            team1Id: { 
              type: 'integer', 
              example: 3 
            },
            team2Id: { 
              type: 'integer', 
              example: 7 
            },
            scheduledAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-06-16T14:00:00Z'
            },
            status: { 
              type: 'string', 
              enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'],
              example: 'SCHEDULED' 
            },
            winnerId: { 
              type: 'integer', 
              nullable: true,
              example: null 
            },
            score: { 
              type: 'string', 
              nullable: true,
              example: '2-1' 
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              example: false 
            },
            error: { 
              type: 'string', 
              example: 'Message d\'erreur détaillé' 
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              example: true 
            },
            message: { 
              type: 'string', 
              example: 'Opération réussie' 
            },
            data: {
              type: 'object',
              description: 'Données de retour'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'] // Scan tous les fichiers de routes
};

export const swaggerSpec = swaggerJsdoc(options);
