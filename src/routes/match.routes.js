import { Router } from 'express';
import matchController from '../controllers/match.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Gestion des matchs de tournoi
 */

/**
 * @swagger
 * /api/matches/tournament/{tournamentId}:
 *   get:
 *     summary: Récupérer tous les matchs d'un tournoi
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ONGOING, COMPLETED, CANCELLED]
 *         description: Filtrer par statut
 *       - in: query
 *         name: round
 *         schema:
 *           type: integer
 *         description: Filtrer par round
 *     responses:
 *       200:
 *         description: Liste des matchs du tournoi
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
 *                     $ref: '#/components/schemas/Match'
 *       404:
 *         description: Tournoi non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/tournament/:tournamentId', matchController.getMatchesByTournament);

/**
 * @swagger
 * /api/matches/team/{teamId}:
 *   get:
 *     summary: Récupérer tous les matchs d'une équipe
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ONGOING, COMPLETED, CANCELLED]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des matchs de l'équipe
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
 *                     $ref: '#/components/schemas/Match'
 *       404:
 *         description: Équipe non trouvée
 */
router.get('/team/:teamId', matchController.getMatchesByTeam);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Récupérer tous les matchs
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ONGOING, COMPLETED, CANCELLED]
 *         description: Filtrer par statut
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de résultats
 *     responses:
 *       200:
 *         description: Liste de tous les matchs
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
 *                     $ref: '#/components/schemas/Match'
 */
router.get('/', matchController.getAllMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Récupérer un match par son ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Détails du match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match non trouvé
 */
router.get('/:id', matchController.getMatchById);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Créer un nouveau match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournamentId
 *               - team1Id
 *               - team2Id
 *               - round
 *             properties:
 *               tournamentId:
 *                 type: integer
 *                 example: 1
 *               team1Id:
 *                 type: integer
 *                 example: 5
 *               team2Id:
 *                 type: integer
 *                 example: 8
 *               round:
 *                 type: integer
 *                 example: 1
 *                 description: Numéro du round (1 = Round 1, 2 = Quart, etc.)
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-15T14:00:00Z"
 *     responses:
 *       201:
 *         description: Match créé avec succès
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
 *                   example: Match créé avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/', matchController.createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Modifier un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-16T16:00:00Z"
 *               round:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Match modifié avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Match non trouvé
 */
router.put('/:id', matchController.updateMatch);

/**
 * @swagger
 * /api/matches/{id}/start:
 *   patch:
 *     summary: Démarrer un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Match démarré
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
 *                   example: Match démarré
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Le match ne peut pas être démarré
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Match non trouvé
 */
router.patch('/:id/start', matchController.startMatch);

/**
 * @swagger
 * /api/matches/{id}/score:
 *   patch:
 *     summary: Mettre à jour le score d'un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team1Score
 *               - team2Score
 *             properties:
 *               team1Score:
 *                 type: integer
 *                 example: 2
 *                 minimum: 0
 *               team2Score:
 *                 type: integer
 *                 example: 1
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Score mis à jour
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
 *                   example: Score mis à jour
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Scores invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Match non trouvé
 */
router.patch('/:id/score', matchController.updateScore);

/**
 * @swagger
 * /api/matches/{id}/complete:
 *   patch:
 *     summary: Terminer un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Match terminé
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
 *                   example: Match terminé
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Le match ne peut pas être terminé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Match non trouvé
 */
router.patch('/:id/complete', matchController.completeMatch);

/**
 * @swagger
 * /api/matches/{id}/cancel:
 *   patch:
 *     summary: Annuler un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Match annulé
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
 *                   example: Match annulé
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Match non trouvé
 */
router.patch('/:id/cancel', matchController.cancelMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Supprimer un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Match supprimé
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
 *                   example: Match supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Match non trouvé
 */
router.delete('/:id', matchController.deleteMatch);

export default router;