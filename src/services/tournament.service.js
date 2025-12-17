const Tournament = require('../models/tournament.model');
const User = require('../models/user.model');

class TournamentService {
  async createTournament(data, organizerId) {
    return await Tournament.create({
      ...data,
      organizerId
    });
  }

  async getAllTournaments(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.game) {
      where.game = filters.game;
    }

    return await Tournament.findAll({
      where,
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'username', 'email']
      }],
      order: [['startDate', 'ASC']]
    });
  }

  async getTournamentById(id) {
    const tournament = await Tournament.findByPk(id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return tournament;
  }

  async updateTournament(id, data, userId, userRole) {
    const tournament = await this.getTournamentById(id);

    // Seul l'organisateur ou un admin peut modifier
    if (tournament.organizerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this tournament');
    }

    await tournament.update(data);
    return tournament;
  }

  async deleteTournament(id, userId, userRole) {
    const tournament = await this.getTournamentById(id);

    // Seul l'organisateur ou un admin peut supprimer
    if (tournament.organizerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to delete this tournament');
    }

    await tournament.destroy();
  }
}

module.exports = new TournamentService();
