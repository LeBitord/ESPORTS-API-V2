import prisma from '../config/database.js';

class RegistrationService {
  async registerTeam(tournamentId, teamId, userId) {
    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    
    if (tournament.status !== 'OPEN') {
      throw new Error('Tournament is not open for registration');
    }

   
    if (tournament.format === 'SOLO') {
      throw new Error('Solo tournaments only accept individual player registrations. Use POST /api/tournaments/:tournamentId/register with playerId instead.');
    }

  
    const confirmedCount = await prisma.registration.count({
      where: {
        tournamentId: parseInt(tournamentId),
        status: 'CONFIRMED'
      }
    });

    if (confirmedCount >= tournament.maxParticipants) {
      throw new Error('Tournament has reached maximum number of participants');
    }

    // Vérifier que l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    
    if (team.captainId !== userId) {
      throw new Error('Only the team captain can register the team for tournaments');
    }

    if (team.game !== tournament.game) {
      throw new Error('Team game does not match tournament game');
    }

    // Vérifier que l'équipe n'est pas déjà inscrite
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        tournamentId: parseInt(tournamentId),
        teamId: parseInt(teamId)
      }
    });

    if (existingRegistration) {
      throw new Error('Team is already registered for this tournament');
    }

    // Créer l'inscription
    return await prisma.registration.create({
      data: {
        tournamentId: parseInt(tournamentId),
        teamId: parseInt(teamId),
        status: 'PENDING'
      },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
            startDate: true,
            status: true,
            format: true
          }
        }
      }
    });
  }

  
  async registerPlayer(tournamentId, playerId, userId) {
    // Vérifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) }
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'OPEN') {
      throw new Error('Tournament is not open for registration');
    }

    // Vérifier cohérence format
    if (tournament.format === 'TEAM') {
      throw new Error('Team tournaments only accept team registrations. Use POST /api/tournaments/:tournamentId/register with teamId instead.');
    }

    // Vérifier limite participants
    const confirmedCount = await prisma.registration.count({
      where: {
        tournamentId: parseInt(tournamentId),
        status: 'CONFIRMED'
      }
    });

    if (confirmedCount >= tournament.maxParticipants) {
      throw new Error('Tournament has reached maximum number of participants');
    }

    // Vérifier que le joueur existe
    const player = await prisma.user.findUnique({
      where: { id: parseInt(playerId) }
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Vérifier que c'est bien le joueur qui s'inscrit lui-même
    if (player.id !== userId) {
      throw new Error('You can only register yourself for solo tournaments');
    }

    if (player.role !== 'PLAYER') {
      throw new Error('Only users with PLAYER role can register for tournaments');
    }

    // Vérifier que le joueur n'est pas déjà inscrit
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        tournamentId: parseInt(tournamentId),
        playerId: parseInt(playerId)
      }
    });

    if (existingRegistration) {
      throw new Error('You are already registered for this tournament');
    }

    // Créer l'inscription
    return await prisma.registration.create({
      data: {
        tournamentId: parseInt(tournamentId),
        playerId: parseInt(playerId),
        status: 'PENDING'
      },
      include: {
        player: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
            startDate: true,
            status: true,
            format: true
          }
        }
      }
    });
  }

  async getTournamentRegistrations(tournamentId) {
    return await prisma.registration.findMany({
      where: {
        tournamentId: parseInt(tournamentId)
      },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            _count: {
              select: { members: true }
            }
          }
        },
        player: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  async getTeamRegistrations(teamId) {
    return await prisma.registration.findMany({
      where: {
        teamId: parseInt(teamId)
      },
      include: {
        tournament: {
          include: {
            organizer: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async updateRegistrationStatus(registrationId, status, userId, userRole) {
    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(registrationId) },
      include: {
        tournament: true,
        team: true,
        player: true
      }
    });

    if (!registration) {
      throw new Error('Registration not found');
    }

    // Seul l'organisateur du tournoi ou un admin peut changer le statut
    if (registration.tournament.organizerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this registration');
    }

    return await prisma.registration.update({
      where: { id: parseInt(registrationId) },
      data: { status },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        player: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
            format: true
          }
        }
      }
    });
  }

  async cancelRegistration(registrationId, userId, userRole) {
    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(registrationId) },
      include: {
        team: true,
        player: true,
        tournament: true
      }
    });

    if (!registration) {
      throw new Error('Registration not found');
    }

  
    if (registration.status === 'CONFIRMED') {
      throw new Error('Cannot delete a confirmed registration. Please use PATCH to change status to WITHDRAWN instead.');
    }

    // Le capitaine de l'équipe, le joueur, l'organisateur ou un admin peuvent annuler
    const canCancel = 
      (registration.team && registration.team.captainId === userId) ||
      (registration.player && registration.playerId === userId) ||
      registration.tournament.organizerId === userId ||
      userRole === 'ADMIN';

    if (!canCancel) {
      throw new Error('Not authorized to cancel this registration');
    }

    await prisma.registration.delete({
      where: { id: parseInt(registrationId) }
    });
  }
}

export const registrationService = new RegistrationService();
