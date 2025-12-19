import { Router } from 'express';
import { registrationController } from '../controllers/registration.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// S'inscrire à un tournoi (PLAYER uniquement)
router.post(
  '/tournaments/:tournamentId/register',
  authorize(['PLAYER']),
  registrationController.register
);

// Voir les inscriptions d'un tournoi
router.get(
  '/tournaments/:tournamentId/registrations',
  registrationController.getTournamentRegistrations
);

// Voir les inscriptions d'une équipe
router.get(
  '/teams/:teamId/registrations',
  registrationController.getTeamRegistrations
);

// Modifier le statut d'une inscription (ORGANIZER ou ADMIN)
router.patch(
  '/tournaments/:tournamentId/registrations/:registrationId',
  authorize(['ORGANIZER', 'ADMIN']),
  registrationController.updateStatus
);

// Annuler une inscription
router.delete(
  '/tournaments/:tournamentId/registrations/:registrationId',
  registrationController.cancelRegistration
);

export default router;
