import { Router } from 'express';
import matchController from '../controllers/match.controller.js';

const router = Router();

// Obtenir les matchs d'un tournoi
router.get('/tournament/:tournamentId', matchController.getMatchesByTournament);

// Obtenir les matchs d'une équipe
router.get('/team/:teamId', matchController.getMatchesByTeam);

// Obtenir tous les matchs
router.get('/', matchController.getAllMatches);

// Obtenir un match par ID
router.get('/:id', matchController.getMatchById);

// Créer un match
router.post('/', matchController.createMatch);

// Modifier un match
router.put('/:id', matchController.updateMatch);

// Démarrer un match
router.patch('/:id/start', matchController.startMatch);

// Mettre à jour le score
router.patch('/:id/score', matchController.updateScore);

// Terminer un match
router.patch('/:id/complete', matchController.completeMatch);

// Annuler un match
router.patch('/:id/cancel', matchController.cancelMatch);

// Supprimer un match
router.delete('/:id', matchController.deleteMatch);

export default router;
