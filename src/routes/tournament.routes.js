import express from 'express';
import tournamentController from '../controllers/tournament.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Gestion des tournois e-sport
 */

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Récupérer tous les tournois
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *         description: Filtrer par jeu (ex. League of Legends)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UPCOMING, ONGOING, COMPLETED, CANCELLED]
 *         description: Filtrer par statut
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *     responses:
 *       200:
 *         description: Liste des tournois
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tournament'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', tournamentController.getAll);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Récupérer un tournoi par son ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi
 *     responses:
 *       200:
 *         description: Détails du tournoi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournoi non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', tournamentController.getById);

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Créer un nouveau tournoi (Organisateur uniquement)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - game
 *               - startDate
 *               - endDate
 *               - maxTeams
 *               - prizePool
 *             properties:
 *               name:
 *                 type: string
 *                 example: World Championship 2024
 *               game:
 *                 type: string
 *                 example: League of Legends
 *               description:
 *                 type: string
 *                 example: Tournoi international avec les meilleures équipes
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-15T09:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-20T18:00:00Z
 *               maxTeams:
 *                 type: integer
 *                 example: 16
 *               prizePool:
 *                 type: number
 *                 format: decimal
 *                 example: 50000.00
 *               rules:
 *                 type: string
 *                 example: Format BO3, draft mode standard
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED, CANCELLED]
 *                 default: UPCOMING
 *     responses:
 *       201:
 *         description: Tournoi créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tournoi créé avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé (rôle insuffisant)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, tournamentController.create);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Modifier un tournoi existant (Organisateur uniquement)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: World Championship 2024 - Updated
 *               game:
 *                 type: string
 *                 example: League of Legends
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxTeams:
 *                 type: integer
 *               prizePool:
 *                 type: number
 *                 format: decimal
 *               rules:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [UPCOMING, ONGOING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Tournoi modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tournoi modifié avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Tournament'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Tournoi non trouvé
 */
router.put('/:id', authenticate, tournamentController.update);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Supprimer un tournoi (Organisateur uniquement)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi à supprimer
 *     responses:
 *       200:
 *         description: Tournoi supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tournoi supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Tournoi non trouvé
 */
router.delete('/:id', authenticate, tournamentController.delete);

export default router;
