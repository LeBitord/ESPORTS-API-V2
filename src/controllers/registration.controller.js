import registrationService from '../services/registration.service.js';
import BaseController from './base.controller.js';

class RegistrationController extends BaseController {
  async register(req, res) {
    try {
      const { teamId, playerId } = req.body;
      const tournamentId = this.parseId(req.params.tournamentId);

      // Validation : teamId OU playerId (pas les deux, pas aucun)
      if ((teamId && playerId) || (!teamId && !playerId)) {
        return this.error(
          res,
          'You must provide either teamId or playerId, but not both',
          400
        );
      }

      let registration;

      if (teamId) {
        const parsedTeamId = this.parseId(teamId, 'teamId');
        registration = await registrationService.registerTeam(
          tournamentId,
          parsedTeamId,
          req.user.id
        );
      } else {
        const parsedPlayerId = this.parseId(playerId, 'playerId');
        registration = await registrationService.registerPlayer(
          tournamentId,
          parsedPlayerId,
          req.user.id
        );
      }

      return this.success(res, registration, 'Registration successful', 201);
    } catch (error) {
      return this.handleError(res, error, 'RegistrationController.register');
    }
  }

  async getTournamentRegistrations(req, res) {
    try {
      const tournamentId = this.parseId(req.params.tournamentId);
      
      const registrations = await registrationService.getTournamentRegistrations(tournamentId);
      
      return this.success(res, registrations, 'Registrations retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'RegistrationController.getTournamentRegistrations');
    }
  }

  async getTeamRegistrations(req, res) {
    try {
      const teamId = this.parseId(req.params.teamId);
      
      const registrations = await registrationService.getTeamRegistrations(teamId);
      
      return this.success(res, registrations, 'Team registrations retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'RegistrationController.getTeamRegistrations');
    }
  }

  async updateStatus(req, res) {
    try {
      const registrationId = this.parseId(req.params.registrationId);
      this.validateRequired(req.body, ['status']);
      
      const { status } = req.body;
      
      const registration = await registrationService.updateRegistrationStatus(
        registrationId,
        status,
        req.user.id,
        req.user.role
      );
      
      return this.success(res, registration, 'Registration status updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'RegistrationController.updateStatus');
    }
  }

  async cancelRegistration(req, res) {
    try {
      const registrationId = this.parseId(req.params.registrationId);
      
      await registrationService.cancelRegistration(
        registrationId,
        req.user.id,
        req.user.role
      );
      
      return this.success(res, null, 'Registration cancelled successfully');
    } catch (error) {
      return this.handleError(res, error, 'RegistrationController.cancelRegistration');
    }
  }
}

export const registrationController = new RegistrationController();
