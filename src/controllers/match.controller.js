import matchService from '../services/match.service.js';
import BaseController from './base.controller.js';

class MatchController extends BaseController {
  async createMatch(req, res) {
    try {
      this.validateRequired(req.body, ['tournamentId', 'teamAId', 'teamBId', 'scheduledAt']);

      const { tournamentId, teamAId, teamBId, scheduledAt, phase } = req.body;

      const match = await matchService.createMatch({
        tournamentId: this.parseId(tournamentId, 'tournamentId'),
        teamAId: this.parseId(teamAId, 'teamAId'),
        teamBId: this.parseId(teamBId, 'teamBId'),
        scheduledAt,
        phase
      });

      return this.success(res, match, 'Match created successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'MatchController.createMatch');
    }
  }

  async getAllMatches(req, res) {
    try {
      const matches = await matchService.getAllMatches();
      
      return this.success(res, matches, 'Matches retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.getAllMatches');
    }
  }

  async getMatchById(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const match = await matchService.getMatchById(id);
      
      return this.success(res, match, 'Match retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.getMatchById');
    }
  }

  async getMatchesByTournament(req, res) {
    try {
      const tournamentId = this.parseId(req.params.tournamentId);
      const matches = await matchService.getMatchesByTournament(tournamentId);
      
      return this.success(res, matches, 'Tournament matches retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.getMatchesByTournament');
    }
  }

  async getMatchesByTeam(req, res) {
    try {
      const teamId = this.parseId(req.params.teamId);
      const matches = await matchService.getMatchesByTeam(teamId);
      
      return this.success(res, matches, 'Team matches retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.getMatchesByTeam');
    }
  }

  async updateMatch(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const { tournamentId, teamAId, teamBId, scheduledAt, phase } = req.body;

      const updateData = {
        ...(tournamentId && { tournamentId: this.parseId(tournamentId, 'tournamentId') }),
        ...(teamAId && { teamAId: this.parseId(teamAId, 'teamAId') }),
        ...(teamBId && { teamBId: this.parseId(teamBId, 'teamBId') }),
        ...(scheduledAt && { scheduledAt }),
        ...(phase && { phase })
      };

      const match = await matchService.updateMatch(id, updateData);
      
      return this.success(res, match, 'Match updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.updateMatch');
    }
  }

  async startMatch(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const match = await matchService.startMatch(id);
      
      return this.success(res, match, 'Match started successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.startMatch');
    }
  }

  async updateScore(req, res) {
    try {
      const id = this.parseId(req.params.id);
      this.validateRequired(req.body, ['scoreTeamA', 'scoreTeamB']);

      const { scoreTeamA, scoreTeamB } = req.body;

      const match = await matchService.updateScore(id, {
        scoreTeamA: parseInt(scoreTeamA),
        scoreTeamB: parseInt(scoreTeamB)
      });

      return this.success(res, match, 'Score updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.updateScore');
    }
  }

  async completeMatch(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const match = await matchService.completeMatch(id);
      
      return this.success(res, match, 'Match completed successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.completeMatch');
    }
  }

  async cancelMatch(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const match = await matchService.cancelMatch(id);
      
      return this.success(res, match, 'Match cancelled successfully');
    } catch (error) {
      return this.handleError(res, error, 'MatchController.cancelMatch');
    }
  }

  async deleteMatch(req, res) {
    try {
      const id = this.parseId(req.params.id);
      await matchService.deleteMatch(id);
      
      return this.success(res, null, 'Match deleted successfully', 204);
    } catch (error) {
      return this.handleError(res, error, 'MatchController.deleteMatch');
    }
  }
}

export default new MatchController();
