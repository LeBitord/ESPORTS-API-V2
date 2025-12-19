# 🎮 API de Gestion de Tournois E-sport

API REST complète pour gérer des tournois e-sport avec authentification, équipes et inscriptions.

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Étapes

1. Cloner le repository
\`\`\`bash
git clone <ton-repo>
cd projet-tournois-esport
\`\`\`

2. Installer les dépendances
\`\`\`bash
npm install
\`\`\`

3. Configurer les variables d'environnement
\`\`\`bash
cp .env.example .env
\`\`\`

Éditer `.env` avec vos informations :
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/esport_db"
JWT_SECRET="your-super-secret-key-change-me"
PORT=3000
\`\`\`

4. Initialiser la base de données
\`\`\`bash
npx prisma migrate dev
npx prisma db seed
\`\`\`

5. Démarrer le serveur
\`\`\`bash
npm run dev
\`\`\`

L'API est accessible sur `http://localhost:3000`

## 📚 Documentation API

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Tournois
- `GET /api/tournaments` - Liste des tournois (filtres: ?status, ?game, ?format)
- `GET /api/tournaments/:id` - Détails d'un tournoi
- `POST /api/tournaments` - Créer un tournoi (ORGANIZER/ADMIN)
- `PUT /api/tournaments/:id` - Modifier un tournoi (ORGANIZER/ADMIN)
- `PATCH /api/tournaments/:id/status` - Changer le statut
- `DELETE /api/tournaments/:id` - Supprimer un tournoi (ORGANIZER/ADMIN)

### Équipes
- `GET /api/teams` - Liste des équipes
- `GET /api/teams/:id` - Détails d'une équipe
- `POST /api/teams` - Créer une équipe
- `PUT /api/teams/:id` - Modifier une équipe (capitaine)
- `DELETE /api/teams/:id` - Supprimer une équipe (capitaine)

### Inscriptions
- `POST /api/tournaments/:tournamentId/register` - S'inscrire
- `GET /api/tournaments/:tournamentId/registrations` - Liste des inscriptions
- `PATCH /api/tournaments/:tournamentId/registrations/:id` - Modifier statut
- `DELETE /api/tournaments/:tournamentId/registrations/:id` - Annuler inscription

### Matchs (bonus)
- `GET /api/matches` - Liste des matchs
- `POST /api/matches` - Créer un match (ORGANIZER/ADMIN)
- `PATCH /api/matches/:id/start` - Démarrer un match
- `PATCH /api/matches/:id/score` - Mettre à jour le score
- `PATCH /api/matches/:id/complete` - Terminer un match

## 🔐 Authentification

Toutes les routes protégées nécessitent un header :
\`\`\`
Authorization: Bearer <votre_token_jwt>
\`\`\`

## 🛠️ Scripts disponibles

- `npm run dev` - Démarre en mode développement (nodemon)
- `npm start` - Démarre en production
- `npx prisma studio` - Interface graphique de la DB
- `npx prisma migrate dev` - Créer une migration

## 👤 Auteur

Projet réalisé dans le cadre du Master Européen Expert IT - Hesias
