import { registrationService } from '../services/registration.service.js';

class RegistrationController {
  async registerTeam(req, res) {
    try {
      const registration = await registrationService.registerTeam(
        parseInt(req.params.tournamentId),
        req.body.teamId,
        req.user.id
      );
      res.status(201).json(registration);
    } catch (error) {
      console.error('❌ Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getTournamentRegistrations(req, res) {
    try {
      const registrations = await registrationService.getTournamentRegistrations(
        parseInt(req.params.tournamentId)
      );
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamRegistrations(req, res) {
    try {
      const registrations = await registrationService.getTeamRegistrations(
        parseInt(req.params.teamId)
      );
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

async updateRegistrationStatus(req, res) {
  try {
    const registration = await registrationService.updateRegistrationStatus(
      parseInt(req.params.id),
      req.body.status,
      req.user.id,
      req.user.role
    );
    res.json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


  async cancelRegistration(req, res) {
    try {
      await registrationService.cancelRegistration(
        parseInt(req.params.id),
        req.user.id
      );
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const registrationController = new RegistrationController();
