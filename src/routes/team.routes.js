import express from 'express';
import teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

// Routes protégées
router.post('/', authenticate, teamController.createTeam);
router.put('/:id', authenticate, teamController.updateTeam);
router.delete('/:id', authenticate, teamController.deleteTeam);
router.post('/:id/members', authenticate, teamController.addMember);
router.delete('/:id/members/:memberId', authenticate, teamController.removeMember);

export default router;
