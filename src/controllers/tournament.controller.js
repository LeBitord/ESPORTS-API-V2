const tournamentService = require('../services/tournament.service');

class TournamentController {
  async create(req, res) {
    try {
      const tournament = await tournamentService.createTournament(
        req.body,
        req.user.id
      );
      
      res.status(201).json(tournament);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { status, game } = req.query;
      const tournaments = await tournamentService.getAllTournaments({ status, game });
      
      res.json(tournaments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      res.json(tournament);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const tournament = await tournamentService.updateTournament(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );
      
      res.json(tournament);
    } catch (error) {
      const status = error.message.includes('Not authorized') ? 403 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await tournamentService.deleteTournament(
        req.params.id,
        req.user.id,
        req.user.role
      );
      
      res.status(204).send();
    } catch (error) {
      const status = error.message.includes('Not authorized') ? 403 : 400;
      res.status(status).json({ error: error.message });
    }
  }
}

module.exports = new TournamentController();
