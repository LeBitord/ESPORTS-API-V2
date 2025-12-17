import prisma from '../config/database.js';

class TeamService {
  async createTeam(data, userId) {
    return await prisma.team.create({
      data: {
        name: data.name,
        tag: data.tag,
        game: data.game,
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async getAllTeams() {
    return await prisma.team.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true,
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getTeamById(id) {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        registrations: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    return team;
  }

  async updateTeam(id, data, userId, userRole) {
    const team = await this.getTeamById(id);

    if (team.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this team');
    }

    return await prisma.team.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        tag: data.tag,
        game: data.game
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async deleteTeam(id, userId, userRole) {
    const team = await this.getTeamById(id);

    if (team.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to delete this team');
    }

    await prisma.team.delete({
      where: { id: parseInt(id) }
    });
  }

  async addMember(teamId, userId, memberId, userRole) {
    const team = await this.getTeamById(teamId);

    if (team.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to add members to this team');
    }

    // Vérifier si le membre existe déjà
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: parseInt(memberId)
        }
      }
    });

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    return await prisma.teamMember.create({
      data: {
        teamId: parseInt(teamId),
        userId: parseInt(memberId),
        role: 'player'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  }

  async removeMember(teamId, memberId, userId, userRole) {
    const team = await this.getTeamById(teamId);

    if (team.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to remove members from this team');
    }

    // Ne pas permettre de retirer le propriétaire
    if (parseInt(memberId) === team.ownerId) {
      throw new Error('Cannot remove team owner');
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: parseInt(memberId)
        }
      }
    });
  }
}

export default new TeamService();
