import prisma from '../config/database.js';
import BaseService from './base.service.js';

class TeamService extends BaseService {
  constructor() {
    super('team');
  }

  /**
   * Créer une équipe
   */
  async createTeam(data, userId) {
    // Vérifier unicité du tag
    const existingTag = await prisma.team.findFirst({
      where: { tag: data.tag }
    });

    if (existingTag) {
      throw new Error('Team tag already exists');
    }

    return await prisma.team.create({
      data: {
        name: data.name,
        tag: data.tag,
        game: data.game,
        ownerId: userId
      },
      include: {
        owner: { select: this.userSelect },
        members: {
          include: {
            user: { select: this.userSelect }
          }
        }
      }
    });
  }

  /**
   * Récupérer toutes les équipes
   */
  async getAllTeams() {
    return await prisma.team.findMany({
      include: {
        owner: { select: this.userSelect },
        _count: {
          select: {
            members: true,
            registrations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Récupérer une équipe par ID
   */
  async getTeamById(id) {
    return await this.findByIdOrFail(id, {
      owner: { select: this.userSelect },
      members: {
        include: {
          user: { select: this.userSelect }
        }
      },
      registrations: {
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              status: true,
              startDate: true
            }
          }
        }
      }
    });
  }

  /**
   * Mettre à jour une équipe
   */
  async updateTeam(id, data, userId, userRole) {
    const parsedId = this.parseId(id);
    const team = await this.getTeamById(parsedId);

    this.checkAuthorization(team.ownerId, userId, userRole, 'update');

    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.game) updateData.game = data.game;

    // Vérifier unicité du tag si changé
    if (data.tag && data.tag !== team.tag) {
      const existingTag = await prisma.team.findFirst({
        where: { tag: data.tag }
      });

      if (existingTag) {
        throw new Error('Team tag already exists');
      }

      updateData.tag = data.tag;
    }

    return await prisma.team.update({
      where: { id: parsedId },
      data: updateData,
      include: {
        owner: { select: this.userSelect },
        members: {
          include: {
            user: { select: this.userSelect }
          }
        }
      }
    });
  }

  /**
   * Supprimer une équipe
   */
  async deleteTeam(id, userId, userRole) {
    const parsedId = this.parseId(id);
    const team = await this.getTeamById(parsedId);

    this.checkAuthorization(team.ownerId, userId, userRole, 'delete');

    // Vérifier qu'il n'y a pas d'inscriptions actives
    const activeRegistrations = await prisma.registration.count({
      where: {
        teamId: parsedId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (activeRegistrations > 0) {
      throw new Error('Cannot delete team with active tournament registrations');
    }

    await prisma.team.delete({
      where: { id: parsedId }
    });
  }

  /**
   * Ajouter un membre
   */
  async addMember(teamId, memberId, userId, userRole) {
    const parsedTeamId = this.parseId(teamId, 'teamId');
    const parsedMemberId = this.parseId(memberId, 'memberId');

    const team = await this.getTeamById(parsedTeamId);

    this.checkAuthorization(team.ownerId, userId, userRole, 'add members to');

    // Vérifier que le membre existe
    const member = await prisma.user.findUnique({
      where: { id: parsedMemberId }
    });

    if (!member) {
      throw new Error('User not found');
    }

    // Vérifier doublon
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: parsedTeamId,
          userId: parsedMemberId
        }
      }
    });

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    return await prisma.teamMember.create({
      data: {
        teamId: parsedTeamId,
        userId: parsedMemberId,
        role: 'MEMBER'
      },
      include: {
        user: { select: this.userSelect }
      }
    });
  }

  /**
   * Retirer un membre
   */
  async removeMember(teamId, memberId, userId, userRole) {
    const parsedTeamId = this.parseId(teamId, 'teamId');
    const parsedMemberId = this.parseId(memberId, 'memberId');

    const team = await this.getTeamById(parsedTeamId);

    this.checkAuthorization(team.ownerId, userId, userRole, 'remove members from');

    if (parsedMemberId === team.ownerId) {
      throw new Error('Cannot remove team owner');
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: parsedTeamId,
          userId: parsedMemberId
        }
      }
    });
  }
}

export default new TeamService();
