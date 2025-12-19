import prisma from '../config/database.js';
import BaseService from './base.service.js';

class RegistrationService extends BaseService {
  constructor() {
    super('registration');
  }

  /**
   * Inscription d'une équipe à un tournoi
   */
  async registerTeam(tournamentId, teamId, userId) {
    const parsedTournamentId = this.parseId(tournamentId, 'tournamentId');
    const parsedTeamId = this.parseId(teamId, 'teamId');

    return await this.transaction(async (tx) => {
      // 1. Vérifier le tournoi
      const tournament = await tx.tournament.findUnique({
        where: { id: parsedTournamentId },
        include: {
          _count: { select: { registrations: true } }
        }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // ✅ CORRIGÉ : Utilise le statut correct
      if (tournament.status !== 'UPCOMING') {
        throw new Error('Tournament is not open for registration');
      }

      // ✅ CORRIGÉ : Utilise maxTeams au lieu de maxParticipants
      const confirmedCount = await tx.registration.count({
        where: {
          tournamentId: parsedTournamentId,
          status: 'APPROVED' // ✅ CORRIGÉ : APPROVED au lieu de CONFIRMED
        }
      });

      if (confirmedCount >= tournament.maxTeams) {
        throw new Error('Tournament has reached maximum number of teams');
      }

      // 2. Vérifier l'équipe
      const team = await tx.team.findUnique({
        where: { id: parsedTeamId }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // ✅ CORRIGÉ : Utilise ownerId au lieu de captainId
      if (team.ownerId !== userId) {
        throw new Error('Only the team owner can register the team');
      }

      if (team.game !== tournament.game) {
        throw new Error(`Team game (${team.game}) does not match tournament game (${tournament.game})`);
      }

      // 3. Vérifier doublon
      const existingRegistration = await tx.registration.findFirst({
        where: {
          tournamentId: parsedTournamentId,
          teamId: parsedTeamId
        }
      });

      if (existingRegistration) {
        throw new Error('Team is already registered for this tournament');
      }

      // 4. Créer l'inscription
      return await tx.registration.create({
        data: {
          tournamentId: parsedTournamentId,
          teamId: parsedTeamId,
          status: 'PENDING'
        },
        include: {
          team: {
            include: {
              owner: { select: this.userSelect }
            }
          },
          tournament: {
            select: {
              id: true,
              name: true,
              game: true,
              startDate: true,
              status: true
            }
          }
        }
      });
    });
  }

  /**
   * Inscription solo d'un joueur
   */
  async registerPlayer(tournamentId, playerId, userId) {
    const parsedTournamentId = this.parseId(tournamentId, 'tournamentId');
    const parsedPlayerId = this.parseId(playerId, 'playerId');

    return await this.transaction(async (tx) => {
      // 1. Vérifier le tournoi
      const tournament = await tx.tournament.findUnique({
        where: { id: parsedTournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'UPCOMING') {
        throw new Error('Tournament is not open for registration');
      }

      // 2. Vérifier le joueur
      const player = await tx.user.findUnique({
        where: { id: parsedPlayerId }
      });

      if (!player) {
        throw new Error('Player not found');
      }

      if (player.id !== userId) {
        throw new Error('You can only register yourself');
      }

      // 3. Vérifier doublon
      const existingRegistration = await tx.registration.findFirst({
        where: {
          tournamentId: parsedTournamentId,
          playerId: parsedPlayerId
        }
      });

      if (existingRegistration) {
        throw new Error('You are already registered for this tournament');
      }

      // 4. Créer l'inscription
      return await tx.registration.create({
        data: {
          tournamentId: parsedTournamentId,
          playerId: parsedPlayerId,
          status: 'PENDING'
        },
        include: {
          player: { select: this.userSelect },
          tournament: {
            select: {
              id: true,
              name: true,
              game: true,
              startDate: true,
              status: true
            }
          }
        }
      });
    });
  }

  /**
   * Récupérer les inscriptions d'un tournoi
   */
  async getTournamentRegistrations(tournamentId) {
    const parsedId = this.parseId(tournamentId, 'tournamentId');

    return await prisma.registration.findMany({
      where: { tournamentId: parsedId },
      include: {
        team: {
          include: {
            owner: { select: this.userSelect },
            _count: { select: { members: true } }
          }
        },
        player: { select: this.userSelect }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Récupérer les inscriptions d'une équipe
   */
  async getTeamRegistrations(teamId) {
    const parsedId = this.parseId(teamId, 'teamId');

    return await prisma.registration.findMany({
      where: { teamId: parsedId },
      include: {
        tournament: {
          include: {
            organizer: { select: this.userSelect }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Mettre à jour le statut d'une inscription
   */
  async updateRegistrationStatus(registrationId, status, userId, userRole) {
    const parsedId = this.parseId(registrationId, 'registrationId');

    const registration = await this.findByIdOrFail(parsedId, {
      tournament: true
    });

    this.checkAuthorization(
      registration.tournament.organizerId,
      userId,
      userRole,
      'update registration status for'
    );

    return await prisma.registration.update({
      where: { id: parsedId },
      data: { status },
      include: {
        team: {
          include: {
            owner: { select: this.userSelect }
          }
        },
        player: { select: this.userSelect },
        tournament: {
          select: {
            id: true,
            name: true,
            game: true
          }
        }
      }
    });
  }

  /**
   * Annuler une inscription
   */
  async cancelRegistration(registrationId, userId, userRole) {
    const parsedId = this.parseId(registrationId, 'registrationId');

    const registration = await this.findByIdOrFail(parsedId, {
      team: true,
      tournament: true
    });

    if (registration.status === 'APPROVED') {
      throw new Error('Cannot delete an approved registration. Change status to REJECTED first.');
    }

    // ✅ CORRIGÉ : Utilise ownerId
    const canCancel =
      (registration.team && registration.team.ownerId === userId) ||
      (registration.playerId === userId) ||
      registration.tournament.organizerId === userId ||
      userRole === 'ADMIN';

    if (!canCancel) {
      throw new Error('Not authorized to cancel this registration');
    }

    await prisma.registration.delete({
      where: { id: parsedId }
    });
  }
}

export default new RegistrationService();
