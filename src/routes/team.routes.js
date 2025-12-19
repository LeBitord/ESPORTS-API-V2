import express from 'express';
import teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Gestion des équipes e-sport
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Récupérer toutes les équipes
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrer par nom d'équipe
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filtrer par tag
 *     responses:
 *       200:
 *         description: Liste des équipes
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
 *                     $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', teamController.getAllTeams);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Récupérer une équipe par son ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Détails de l'équipe avec ses membres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Team'
 *                     - type: object
 *                       properties:
 *                         members:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *       404:
 *         description: Équipe non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', teamController.getTeamById);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Créer une nouvelle équipe
 *     tags: [Teams]
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
 *               - tag
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: Team Phoenix
 *               tag:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 5
 *                 example: PHX
 *               description:
 *                 type: string
 *                 example: Équipe compétitive multi-jeux
 *     responses:
 *       201:
 *         description: Équipe créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: Le nom ou tag existe déjà
 */
router.post('/', authenticate, teamController.createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Modifier une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Team Phoenix Reborn
 *               tag:
 *                 type: string
 *                 example: PHXR
 *               description:
 *                 type: string
 *                 example: Nouvelle description
 *     responses:
 *       200:
 *         description: Équipe modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (seul le capitaine peut modifier)
 *       404:
 *         description: Équipe non trouvée
 */
router.put('/:id', authenticate, teamController.updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Supprimer une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Équipe supprimée avec succès
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
 *                   example: Équipe supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (seul le capitaine ou admin)
 *       404:
 *         description: Équipe non trouvée
 */
router.delete('/:id', authenticate, teamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Ajouter un membre à l'équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 10
 *                 description: ID de l'utilisateur à ajouter
 *     responses:
 *       200:
 *         description: Membre ajouté avec succès
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
 *                   example: Membre ajouté avec succès
 *       400:
 *         description: L'utilisateur est déjà dans une équipe
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Seul le capitaine peut ajouter des membres
 *       404:
 *         description: Équipe ou utilisateur non trouvé
 */
router.post('/:id/members', authenticate, teamController.addMember);

/**
 * @swagger
 * /api/teams/{id}/members/{memberId}:
 *   delete:
 *     summary: Retirer un membre de l'équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'équipe
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du membre à retirer
 *     responses:
 *       200:
 *         description: Membre retiré avec succès
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
 *                   example: Membre retiré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Seul le capitaine peut retirer des membres
 *       404:
 *         description: Équipe ou membre non trouvé
 */
router.delete('/:id/members/:memberId', authenticate, teamController.removeMember);

export default router;
