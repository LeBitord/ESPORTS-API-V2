import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { registrationController } from '../controllers/registration.controller.js';

const router = express.Router();

// Routes publiques
router.get('/tournament/:tournamentId', registrationController.getTournamentRegistrations);
router.get('/team/:teamId', registrationController.getTeamRegistrations);

// Routes protégées
router.post('/tournament/:tournamentId', authenticate, registrationController.registerTeam);
router.patch('/:id/status', authenticate, registrationController.updateRegistrationStatus);
router.delete('/:id', authenticate, registrationController.cancelRegistration);

export default router;