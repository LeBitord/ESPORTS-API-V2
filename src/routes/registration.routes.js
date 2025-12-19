import { Router } from 'express';
import { registrationController } from '../controllers/registration.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Gestion des inscriptions aux tournois
 */

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/registrations/tournaments/{tournamentId}/register:
 *   post:
 *     summary: S'inscrire à un tournoi
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
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
 *               teamId:
 *                 type: integer
 *                 example: 5
 *                 description: ID de l'équipe (pour tournois en équipe)
 *     responses:
 *       201:
 *         description: Inscription créée avec succès
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
 *                   example: Inscription réussie
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Inscription impossible (tournoi complet, déjà inscrit, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle non autorisé (PLAYER uniquement)
 *       404:
 *         description: Tournoi non trouvé
 */
router.post(
  '/tournaments/:tournamentId/register',
  authorize(['PLAYER']),
  registrationController.register
);

/**
 * @swagger
 * /api/registrations/tournaments/{tournamentId}/registrations:
 *   get:
 *     summary: Voir toutes les inscriptions d'un tournoi
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
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
 *           enum: [PENDING, ACCEPTED, REJECTED, CANCELLED]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des inscriptions
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
 *                     $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Tournoi non trouvé
 */
router.get(
  '/tournaments/:tournamentId/registrations',
  registrationController.getTournamentRegistrations
);

/**
 * @swagger
 * /api/registrations/teams/{teamId}/registrations:
 *   get:
 *     summary: Voir toutes les inscriptions d'une équipe
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
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
 *           enum: [PENDING, ACCEPTED, REJECTED, CANCELLED]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des inscriptions de l'équipe
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
 *                     $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Équipe non trouvée
 */
router.get(
  '/teams/:teamId/registrations',
  registrationController.getTeamRegistrations
);

/**
 * @swagger
 * /api/registrations/tournaments/{tournamentId}/registrations/{registrationId}:
 *   patch:
 *     summary: Modifier le statut d'une inscription
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'inscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *                 example: ACCEPTED
 *                 description: Nouveau statut de l'inscription
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
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
 *                   example: Statut mis à jour
 *                 data:
 *                   $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Statut invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (ORGANIZER ou ADMIN uniquement)
 *       404:
 *         description: Inscription non trouvée
 */
router.patch(
  '/tournaments/:tournamentId/registrations/:registrationId',
  authorize(['ORGANIZER', 'ADMIN']),
  registrationController.updateStatus
);

/**
 * @swagger
 * /api/registrations/tournaments/{tournamentId}/registrations/{registrationId}:
 *   delete:
 *     summary: Annuler une inscription
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du tournoi
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'inscription
 *     responses:
 *       200:
 *         description: Inscription annulée avec succès
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
 *                   example: Inscription annulée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (seul l'auteur de l'inscription peut annuler)
 *       404:
 *         description: Inscription non trouvée
 */
router.delete(
  '/tournaments/:tournamentId/registrations/:registrationId',
  registrationController.cancelRegistration
);

export default router;
