import teamService from '../services/team.service.js';
import BaseController from './base.controller.js';

class TeamController extends BaseController {
  async createTeam(req, res) {
    try {
      this.validateRequired(req.body, ['name']);

      const team = await teamService.createTeam(req.body, req.user.id);
      
      return this.success(res, team, 'Team created successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'TeamController.createTeam');
    }
  }

  async getAllTeams(req, res) {
    try {
      const teams = await teamService.getAllTeams();
      
      return this.success(res, teams, 'Teams retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'TeamController.getAllTeams');
    }
  }

  async getTeamById(req, res) {
    try {
      const id = this.parseId(req.params.id);
      const team = await teamService.getTeamById(id);
      
      return this.success(res, team, 'Team retrieved successfully');
    } catch (error) {
      return this.handleError(res, error, 'TeamController.getTeamById');
    }
  }

  async updateTeam(req, res) {
    try {
      const id = this.parseId(req.params.id);
      
      const team = await teamService.updateTeam(
        id,
        req.body,
        req.user.id,
        req.user.role
      );
      
      return this.success(res, team, 'Team updated successfully');
    } catch (error) {
      return this.handleError(res, error, 'TeamController.updateTeam');
    }
  }

  async deleteTeam(req, res) {
    try {
      const id = this.parseId(req.params.id);
      
      await teamService.deleteTeam(id, req.user.id, req.user.role);
      
      return this.success(res, null, 'Team deleted successfully', 204);
    } catch (error) {
      return this.handleError(res, error, 'TeamController.deleteTeam');
    }
  }

  async addMember(req, res) {
    try {
      const teamId = this.parseId(req.params.id);
      this.validateRequired(req.body, ['userId']);
      
      const userId = this.parseId(req.body.userId, 'userId');
      
      const member = await teamService.addMember(
        teamId,
        req.user.id,
        userId,
        req.user.role
      );
      
      return this.success(res, member, 'Member added successfully', 201);
    } catch (error) {
      return this.handleError(res, error, 'TeamController.addMember');
    }
  }

  async removeMember(req, res) {
    try {
      const teamId = this.parseId(req.params.id);
      const memberId = this.parseId(req.params.memberId);
      
      await teamService.removeMember(
        teamId,
        memberId,
        req.user.id,
        req.user.role
      );
      
      return this.success(res, null, 'Member removed successfully', 204);
    } catch (error) {
      return this.handleError(res, error, 'TeamController.removeMember');
    }
  }
}

export default new TeamController();
