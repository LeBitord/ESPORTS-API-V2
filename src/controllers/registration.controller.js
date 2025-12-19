import { registrationService } from '../services/registration.service.js';

class RegistrationController {
  async register(req, res) {
    try {
      const { teamId, playerId } = req.body;
      const tournamentId = req.params.tournamentId;
      const userId = req.user.id;

      // Vérifier qu'on a bien teamId OU playerId (pas les deux, pas aucun)
      if ((teamId && playerId) || (!teamId && !playerId)) {
        return res.status(400).json({
          error: 'You must provide either teamId (for team tournaments) or playerId (for solo tournaments), but not both'
        });
      }

      let registration;

      if (teamId) {
        // Inscription d'équipe
        registration = await registrationService.registerTeam(
          tournamentId,
          teamId,
          userId
        );
      } else {
        // Inscription solo
        registration = await registrationService.registerPlayer(
          tournamentId,
          playerId,
          userId
        );
      }

      res.status(201).json(registration);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getTournamentRegistrations(req, res) {
    try {
      const registrations = await registrationService.getTournamentRegistrations(
        req.params.tournamentId
      );
      res.json(registrations);
    } catch (error) {
      console.error('Get registrations error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getTeamRegistrations(req, res) {
    try {
      const registrations = await registrationService.getTeamRegistrations(
        req.params.teamId
      );
      res.json(registrations);
    } catch (error) {
      console.error('Get team registrations error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const registration = await registrationService.updateRegistrationStatus(
        req.params.registrationId,
        status,
        req.user.id,
        req.user.role
      );
      res.json(registration);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async cancelRegistration(req, res) {
    try {
      await registrationService.cancelRegistration(
        req.params.registrationId,
        req.user.id,
        req.user.role
      );
      res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
      console.error('Cancel registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export const registrationController = new RegistrationController();
