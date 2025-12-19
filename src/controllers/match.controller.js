import matchService from '../services/match.service.js';

class MatchController {
  // Créer un match
  async createMatch(req, res) {
    try {
      const { tournamentId, teamAId, teamBId, scheduledAt, phase } = req.body;

      // Validation
      if (!tournamentId || !teamAId || !teamBId || !scheduledAt) {
        return res.status(400).json({
          error: 'tournamentId, teamAId, teamBId and scheduledAt are required'
        });
      }

      const match = await matchService.createMatch({
        tournamentId: parseInt(tournamentId),
        teamAId: parseInt(teamAId),
        teamBId: parseInt(teamBId),
        scheduledAt,
        phase
      });

      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtenir tous les matchs
  async getAllMatches(req, res) {
    try {
      const matches = await matchService.getAllMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir un match par ID
  async getMatchById(req, res) {
    try {
      const match = await matchService.getMatchById(parseInt(req.params.id));
      res.json(match);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Obtenir les matchs d'un tournoi
  async getMatchesByTournament(req, res) {
    try {
      const matches = await matchService.getMatchesByTournament(
        parseInt(req.params.tournamentId)
      );
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir les matchs d'une équipe
  async getMatchesByTeam(req, res) {
    try {
      const matches = await matchService.getMatchesByTeam(
        parseInt(req.params.teamId)
      );
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    // Mettre à jour un match
  async updateMatch(req, res) {
    try {
      const { tournamentId, teamAId, teamBId, scheduledAt, phase } = req.body;

      const match = await matchService.updateMatch(
        parseInt(req.params.id),
        {
          tournamentId: tournamentId ? parseInt(tournamentId) : undefined,
          teamAId: teamAId ? parseInt(teamAId) : undefined,
          teamBId: teamBId ? parseInt(teamBId) : undefined,
          scheduledAt,
          phase
        }
      );

      res.json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Démarrer un match
  async startMatch(req, res) {
    try {
      const match = await matchService.startMatch(parseInt(req.params.id));
      res.json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Mettre à jour le score
  async updateScore(req, res) {
    try {
      const { scoreTeamA, scoreTeamB } = req.body;

      if (scoreTeamA === undefined || scoreTeamB === undefined) {
        return res.status(400).json({
          error: 'scoreTeamA and scoreTeamB are required'
        });
      }

      const match = await matchService.updateScore(
        parseInt(req.params.id),
        {
          scoreTeamA: parseInt(scoreTeamA),
          scoreTeamB: parseInt(scoreTeamB)
        }
      );

      res.json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Terminer un match
  async completeMatch(req, res) {
    try {
      const match = await matchService.completeMatch(parseInt(req.params.id));
      res.json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Annuler un match
  async cancelMatch(req, res) {
    try {
      const match = await matchService.cancelMatch(parseInt(req.params.id));
      res.json(match);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Supprimer un match
  async deleteMatch(req, res) {
    try {
      await matchService.deleteMatch(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new MatchController();