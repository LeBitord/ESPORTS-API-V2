const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Routes publiques
router.get('/', tournamentController.getAll);
router.get('/:id', tournamentController.getById);

// Routes protégées
router.post('/', authenticate, tournamentController.create);
router.put('/:id', authenticate, tournamentController.update);
router.delete('/:id', authenticate, tournamentController.delete);

module.exports = router;
