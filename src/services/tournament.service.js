import prisma from '../config/database.js';
import BaseService from './base.service.js';

class TournamentService extends BaseService {
  constructor() {
    super('tournament');
  }

  /**
   * Créer un tournoi
   */
  async createTournament(data, organizerId) {
    // Validations
    const startDate = this.validateDate(data.startDate, 'startDate');
    const endDate = this.validateDate(data.endDate, 'endDate');

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const prizePool = this.validatePositive(data.prizePool, 'prizePool');
    const maxTeams = this.validatePositive(data.maxTeams, 'maxTeams');

    return await prisma.tournament.create({
      data: {
        name: data.name,
        game: data.game,
        startDate,
        endDate,
        prizePool,
        maxTeams,
        status: data.status || 'UPCOMING',
        rules: data.rules || null,
        organizer: {
          connect: { id: organizerId }
        }
      },
      include: {
        organizer: { select: this.userSelect }
      }
    });
  }

  /**
   * Récupérer tous les tournois
   */
  async getAllTournaments(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.game) {
      where.game = filters.game;
    }

    return await prisma.tournament.findMany({
      where,
      include: {
        organizer: { select: this.userSelect },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Récupérer un tournoi par ID
   */
  async getTournamentById(id) {
    return await this.findByIdOrFail(id, {
      organizer: { select: this.userSelect },
      registrations: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              tag: true
            }
          }
        }
      },
      _count: { select: { registrations: true, matches: true } }
    });
  }

  /**
   * Mettre à jour un tournoi
   */
  async updateTournament(id, data, userId, userRole) {
    const parsedId = this.parseId(id);
    const tournament = await this.getTournamentById(parsedId);

    this.checkAuthorization(tournament.organizerId, userId, userRole, 'update');

    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.game) updateData.game = data.game;
    if (data.prizePool) updateData.prizePool = this.validatePositive(data.prizePool, 'prizePool');
    if (data.maxTeams) updateData.maxTeams = this.validatePositive(data.maxTeams, 'maxTeams');
    if (data.status) updateData.status = data.status;
    if (data.rules !== undefined) updateData.rules = data.rules;

    if (data.startDate) {
      updateData.startDate = this.validateDate(data.startDate, 'startDate');
    }

    if (data.endDate) {
      updateData.endDate = this.validateDate(data.endDate, 'endDate');
    }

    // Valider cohérence des dates
    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate >= updateData.endDate) {
        throw new Error('Start date must be before end date');
      }
    }

    return await prisma.tournament.update({
      where: { id: parsedId },
      data: updateData,
      include: {
        organizer: { select: this.userSelect }
      }
    });
  }

  /**
   * Supprimer un tournoi
   */
  async deleteTournament(id, userId, userRole) {
    const parsedId = this.parseId(id);
    const tournament = await this.getTournamentById(parsedId);

    this.checkAuthorization(tournament.organizerId, userId, userRole, 'delete');

    await prisma.tournament.delete({
      where: { id: parsedId }
    });
  }
}

export default new TournamentService();
