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

    if (tournament.status !== 'UPCOMING') {
      throw new Error('Tournament is not open for registration');
    }

    if (tournament._count.registrations >= tournament.maxTeams) {
      throw new Error('Tournament is full');
    }

    // Vérifier que l'équipe existe et que l'utilisateur en est le propriétaire
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new Error('Only team owner can register the team');
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
            owner: {
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
            status: true
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
            owner: {
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
        tournament: true
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
            owner: {
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
            game: true
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
        tournament: true
      }
    });

    if (!registration) {
      throw new Error('Registration not found');
    }

    // Le propriétaire de l'équipe, l'organisateur du tournoi ou un admin peuvent annuler
    const canCancel = 
      registration.team.ownerId === userId ||
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
