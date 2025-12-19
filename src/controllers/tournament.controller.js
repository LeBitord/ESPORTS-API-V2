import tournamentService from '../services/tournament.service.js';
import BaseController from './base.controller.js';

class TournamentController extends BaseController {
  async create(req, res) {
    try {
      // Validation
      this.validateRequired(req.body, ['name', 'game', 'maxParticipants', 'startDate']);

      const tournament = await tournamentService.createTournament(
        req.body,
        req.user.id
      );

      return this.success(res, tournament, 'Tournament created successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'TournamentController.create');
    }
  }

  async getAll(req, res) {
    try {
      const { status, game } = req.query;
      const tournaments = await tournamentService.getAllTournaments({ status, game });

      return this.success(res, tournaments, 'Tournaments retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'TournamentController.getAll');
    }
  }

  async getById(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const tournament = await tournamentService.getTournamentById(id);

      return this.success(res, tournament, 'Tournament retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'TournamentController.getById');
    }
  }

  async update(req, res) {
    try {
      const id = this.parseId(req.params.id);
      
      const tournament = await tournamentService.updateTournament(
        id,
        req.body,
        req.user.id,
        req.user.role
      );

      return this.success(res, tournament, 'Tournament updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'TournamentController.update');
    }
  }

  async delete(req, res) {
    try {
      const id = this.parseId(req.params.id);
      
      await tournamentService.deleteTournament(
        id,
        req.user.id,
        req.user.role
      );

      return this.success(res, null, 'Tournament deleted successfully', 204);
    } catch (error) {
      return this.handleError(res, error, 'TournamentController.delete');
    }
  }
}

export default new TournamentController();