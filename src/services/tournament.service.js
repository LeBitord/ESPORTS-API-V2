import prisma from '../config/database.js';

class TournamentService {
  async createTournament(data, organizerId) {
    return await prisma.tournament.create({
      data: {
        name: data.name,
        game: data.game,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        prizePool: data.prizePool,
        maxTeams: data.maxTeams,
        status: data.status,
        rules: data.rules || null,
        organizer: {
          connect: { id: organizerId }  // ← Utilise connect au lieu de organizerId
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  }

  async getAllTournaments() {
    return await prisma.tournament.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getTournamentById(id) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        registrations: {
          include: {
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return tournament;
  }

  async updateTournament(id, data, userId, userRole) {
    const tournament = await this.getTournamentById(id);

    // Vérifie que c'est l'organisateur ou un admin
    if (tournament.organizer.id !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this tournament');
    }

    const updateData = {
      name: data.name,
      game: data.game,
      prizePool: data.prizePool,
      maxTeams: data.maxTeams,
      status: data.status,
      rules: data.rules
    };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return await prisma.tournament.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  }

  async deleteTournament(id, userId, userRole) {
    const tournament = await this.getTournamentById(id);

    if (tournament.organizer.id !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to delete this tournament');
    }

    await prisma.tournament.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default new TournamentService();
