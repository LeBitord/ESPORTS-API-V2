import teamService from '../services/team.service.js';

class TeamController {
  async createTeam(req, res) {
    try {
      const team = await teamService.createTeam(req.body, req.user.id);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllTeams(req, res) {
    try {
      const teams = await teamService.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamById(req, res) {
    try {
      const team = await teamService.getTeamById(req.params.id);
      res.json(team);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateTeam(req, res) {
    try {
      const team = await teamService.updateTeam(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );
      res.json(team);
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async deleteTeam(req, res) {
    try {
      await teamService.deleteTeam(req.params.id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async addMember(req, res) {
    try {
      const member = await teamService.addMember(
        req.params.id,
        req.user.id,
        req.body.userId,
        req.user.role
      );
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      await teamService.removeMember(
        req.params.id,
        req.params.memberId,
        req.user.id,
        req.user.role
      );
      res.status(204).send();
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }
}

export default new TeamController();
