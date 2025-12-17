import express from 'express';
import tournamentController from '../controllers/tournament.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getById);

// Routes protégées
router.post('/', authenticate, tournamentController.create);
router.put('/:id', authenticate, tournamentController.update);
router.delete('/:id', authenticate, tournamentController.delete);

export default router;
