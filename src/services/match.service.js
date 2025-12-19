import prisma from '../config/database.js';
import BaseService from './base.service.js';

class MatchService extends BaseService {
  constructor() {
    super('match');
  }

  /**
   * Créer un match
   */
  async createMatch(data) {
    const tournamentId = this.parseId(data.tournamentId, 'tournamentId');
    const teamAId = this.parseId(data.teamAId, 'teamAId');
    const teamBId = this.parseId(data.teamBId, 'teamBId');

    if (teamAId === teamBId) {
      throw new Error('A team cannot play against itself');
    }

    return await this.transaction(async (tx) => {
      // Vérifier tournoi
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Vérifier équipes
      const [teamA, teamB] = await Promise.all([
        tx.team.findUnique({ where: { id: teamAId } }),
        tx.team.findUnique({ where: { id: teamBId } })
      ]);

      if (!teamA || !teamB) {
        throw new Error('One or both teams not found');
      }

      // Vérifier inscriptions
      const [regA, regB] = await Promise.all([
        tx.registration.findFirst({
          where: {
            tournamentId,
            teamId: teamAId,
            status: 'APPROVED'
          }
        }),
        tx.registration.findFirst({
          where: {
            tournamentId,
            teamId: teamBId,
            status: 'APPROVED'
          }
        })
      ]);

      if (!regA || !regB) {
        throw new Error('Both teams must be registered and approved for this tournament');
      }

      return await tx.match.create({
        data: {
          tournamentId,
          teamAId,
          teamBId,
          scheduledAt: this.validateDate(data.scheduledAt, 'scheduledAt'),
          phase: data.phase,
          status: 'SCHEDULED'
        },
        include: {
          tournament: {
            select: { id: true, name: true }
          },
          teamA: {
            select: { id: true, name: true, tag: true }
          },
          teamB: {
            select: { id: true, name: true, tag: true }
          }
        }
      });
    });
  }

  /**
   * Récupérer tous les matchs
   */
  async getAllMatches() {
    return await prisma.match.findMany({
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
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  /**
   * Récupérer un match par ID
   */
  async getMatchById(id) {
    return await this.findByIdOrFail(id, {
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
    });
  }

  /**
   * Récupérer les matchs d'un tournoi
   */
  async getMatchesByTournament(tournamentId) {
    const parsedId = this.parseId(tournamentId, 'tournamentId');

    return await prisma.match.findMany({
      where: { tournamentId: parsedId },
      include: {
        teamA: {
          select: { id: true, name: true, tag: true }
        },
        teamB: {
          select: { id: true, name: true, tag: true }
        },
        winner: {
          select: { id: true, name: true, tag: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  /**
   * Récupérer les matchs d'une équipe
   */
  async getMatchesByTeam(teamId) {
    const parsedId = this.parseId(teamId, 'teamId');

    return await prisma.match.findMany({
      where: {
        OR: [
          { teamAId: parsedId },
          { teamBId: parsedId }
        ]
      },
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
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  /**
   * Mettre à jour un match
   */
  async updateMatch(matchId, data) {
    const parsedId = this.parseId(matchId);
    const match = await this.getMatchById(parsedId);

    if (match.status === 'COMPLETED') {
      throw new Error('Cannot update a completed match');
    }

    const updateData = {};

    if (data.tournamentId !== undefined) {
      updateData.tournamentId = this.parseId(data.tournamentId, 'tournamentId');
    }

    if (data.teamAId !== undefined) {
      updateData.teamAId = this.parseId(data.teamAId, 'teamAId');
    }

    if (data.teamBId !== undefined) {
      updateData.teamBId = this.parseId(data.teamBId, 'teamBId');
    }

    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = this.validateDate(data.scheduledAt, 'scheduledAt');
    }

    if (data.phase !== undefined) {
      updateData.phase = data.phase;
    }

    return await prisma.match.update({
      where: { id: parsedId },
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

  /**
   * Démarrer un match
   */
  async startMatch(id) {
    const parsedId = this.parseId(id);
    const match = await this.getMatchById(parsedId);

    if (match.status !== 'SCHEDULED') {
      throw new Error('Only scheduled matches can be started');
    }

    return await prisma.match.update({
      where: { id: parsedId },
      data: { status: 'ONGOING' },
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        teamA: {
          select: { id: true, name: true, tag: true }
        },
        teamB: {
          select: { id: true, name: true, tag: true }
        }
      }
    });
  }

  /**
   * Mettre à jour le score
   */
  async updateScore(id, data) {
    const parsedId = this.parseId(id);
    const match = await this.getMatchById(parsedId);

    if (match.status === 'COMPLETED') {
      throw new Error('Cannot update score of a completed match');
    }

    const scoreTeamA = this.validatePositive(data.scoreTeamA, 'scoreTeamA') - 1; // -1 car validatePositive exige > 0
    const scoreTeamB = this.validatePositive(data.scoreTeamB, 'scoreTeamB') - 1;

    return await prisma.match.update({
      where: { id: parsedId },
      data: {
        scoreTeamA: scoreTeamA + 1,
        scoreTeamB: scoreTeamB + 1
      },
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        teamA: {
          select: { id: true, name: true, tag: true }
        },
        teamB: {
          select: { id: true, name: true, tag: true }
        }
      }
    });
  }

  /**
   * Terminer un match
   */
  async completeMatch(id, winnerId = null) {
    const parsedId = this.parseId(id);
    const match = await this.getMatchById(parsedId);

    if (match.status === 'COMPLETED') {
      throw new Error('Match is already completed');
    }

    if (match.scoreTeamA === null || match.scoreTeamB === null) {
      throw new Error('Cannot complete match without scores');
    }

    // Calcul automatique du gagnant
    let finalWinnerId = winnerId;
    if (!finalWinnerId) {
      if (match.scoreTeamA > match.scoreTeamB) {
        finalWinnerId = match.teamAId;
      } else if (match.scoreTeamB > match.scoreTeamA) {
        finalWinnerId = match.teamBId;
      }
    }

    return await prisma.match.update({
      where: { id: parsedId },
      data: {
        status: 'COMPLETED',
        winnerId: finalWinnerId
      },
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

  /**
   * Annuler un match
   */
  async cancelMatch(id) {
    const parsedId = this.parseId(id);
    const match = await this.getMatchById(parsedId);

    if (match.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed match');
    }

    return await prisma.match.update({
      where: { id: parsedId },
      data: {
        status: 'CANCELLED',
        scoreTeamA: null,
        scoreTeamB: null,
        winnerId: null
      },
      include: {
        tournament: {
          select: { id: true, name: true }
        },
        teamA: {
          select: { id: true, name: true, tag: true }
        },
        teamB: {
          select: { id: true, name: true, tag: true }
        }
      }
    });
  }

  /**
   * Supprimer un match
   */
  async deleteMatch(id) {
    const parsedId = this.parseId(id);
    await this.getMatchById(parsedId); // Vérifier existence

    await prisma.match.delete({
      where: { id: parsedId }
    });
  }
}

export default new MatchService();
