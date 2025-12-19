import prisma from '../config/database.js';

class MatchService {
  // Créer un match
  async createMatch(data) {
    const { tournamentId, teamAId, teamBId, scheduledAt, phase } = data;

    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Vérifier que les deux équipes existent
    const teamA = await prisma.team.findUnique({ where: { id: teamAId } });
    const teamB = await prisma.team.findUnique({ where: { id: teamBId } });

    if (!teamA || !teamB) {
      throw new Error('One or both teams not found');
    }

    // Vérifier que les équipes sont différentes
    if (teamAId === teamBId) {
      throw new Error('A team cannot play against itself');
    }

    // Vérifier que les équipes sont inscrites au tournoi
    const regA = await prisma.registration.findFirst({
      where: { tournamentId, teamId: teamAId, status: 'APPROVED' }
    });
    const regB = await prisma.registration.findFirst({
      where: { tournamentId, teamId: teamBId, status: 'APPROVED' }
    });

    if (!regA || !regB) {
      throw new Error('Both teams must be registered and approved for this tournament');
    }

    return prisma.match.create({
      data: {
        tournamentId,
        teamAId,
        teamBId,
        scheduledAt: new Date(scheduledAt),
        phase,
        status: 'SCHEDULED'
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true
      }
    });
  }

  // Obtenir tous les matchs
  async getAllMatches() {
    return prisma.match.findMany({
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        winner: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  // Obtenir un match par ID
  async getMatchById(id) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        winner: true
      }
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return match;
  }

  // Obtenir les matchs d'un tournoi
  async getMatchesByTournament(tournamentId) {
    return prisma.match.findMany({
      where: { tournamentId },
      include: {
        teamA: true,
        teamB: true,
        winner: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  // Obtenir les matchs d'une équipe
  async getMatchesByTeam(teamId) {
    return prisma.match.findMany({
      where: {
        OR: [
          { teamAId: teamId },
          { teamBId: teamId }
        ]
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        winner: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  // Mettre à jour un match
  async updateMatch(matchId, data) {
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      throw new Error('Match not found');
    }

    // Empêcher la modification d'un match terminé
    if (match.status === 'COMPLETED') {
      throw new Error('Cannot update a completed match');
    }

    // Filtrer les données undefined
    const updateData = {};
    if (data.tournamentId !== undefined) updateData.tournamentId = data.tournamentId;
    if (data.teamAId !== undefined) updateData.teamAId = data.teamAId;
    if (data.teamBId !== undefined) updateData.teamBId = data.teamBId;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.phase !== undefined) updateData.phase = data.phase;

    return await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        teamA: {
          select: { id: true, name: true, tag: true }
        },
        teamB: {
          select: { id: true, name: true, tag: true }
        },
        winner: {
          select: { id: true, name: true, tag: true }
        }
      }
    });
  }

  // Démarrer un match
  async startMatch(id) {
    const match = await this.getMatchById(id);

    if (match.status !== 'SCHEDULED') {
      throw new Error('Only scheduled matches can be started');
    }

    return prisma.match.update({
      where: { id },
      data: { status: 'ONGOING' },
      include: {
        tournament: true,
        teamA: true,
        teamB: true
      }
    });
  }

  // ✅ Mettre à jour le score (SANS calculer le winnerId)
  async updateScore(id, data) {
    const match = await this.getMatchById(id);

    if (match.status === 'COMPLETED') {
      throw new Error('Cannot update score of a completed match');
    }

    const { scoreTeamA, scoreTeamB } = data;

    return prisma.match.update({
      where: { id },
      data: {
        scoreTeamA,
        scoreTeamB
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true
      }
    });
  }

  // Terminer un match (AVEC calcul automatique du winnerId)
  async completeMatch(id, winnerId = null) {
    const match = await this.getMatchById(id);

    if (match.status === 'COMPLETED') {
      throw new Error('Match is already completed');
    }

    if (match.scoreTeamA === null || match.scoreTeamB === null) {
      throw new Error('Cannot complete match without scores');
    }

    // ✅ Calcul automatique du winnerId si non fourni
    let finalWinnerId = winnerId;
    if (!finalWinnerId) {
      if (match.scoreTeamA > match.scoreTeamB) {
        finalWinnerId = match.teamAId;
      } else if (match.scoreTeamB > match.scoreTeamA) {
        finalWinnerId = match.teamBId;
      }
      // Si égalité, finalWinnerId reste null
    }

    return prisma.match.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        winnerId: finalWinnerId
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true,
        winner: true
      }
    });
  }

  // Annuler un match
  async cancelMatch(id) {
    const match = await this.getMatchById(id);

    if (match.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed match');
    }

    return prisma.match.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        scoreTeamA: null,
        scoreTeamB: null,
        winnerId: null
      },
      include: {
        tournament: true,
        teamA: true,
        teamB: true
      }
    });
  }

  // Supprimer un match
  async deleteMatch(id) {
    await this.getMatchById(id); // Vérifier l'existence
    return prisma.match.delete({ where: { id } });
  }
}

export default new MatchService();
