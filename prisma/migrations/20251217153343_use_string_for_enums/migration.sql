/*
  Warnings:

  - You are about to drop the column `registeredAt` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `registrations` table. All the data in the column will be lost.
  - You are about to alter the column `prizePool` on the `tournaments` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    CONSTRAINT "registrations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registrations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_registrations" ("id", "status", "teamId", "tournamentId", "updatedAt") SELECT "id", "status", "teamId", "tournamentId", "updatedAt" FROM "registrations";
DROP TABLE "registrations";
ALTER TABLE "new_registrations" RENAME TO "registrations";
CREATE UNIQUE INDEX "registrations_tournamentId_teamId_key" ON "registrations"("tournamentId", "teamId");
CREATE TABLE "new_tournaments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "prizePool" INTEGER,
    "maxTeams" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "rules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizerId" INTEGER NOT NULL,
    CONSTRAINT "tournaments_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tournaments" ("createdAt", "endDate", "game", "id", "maxTeams", "name", "organizerId", "prizePool", "rules", "startDate", "status", "updatedAt") SELECT "createdAt", "endDate", "game", "id", "maxTeams", "name", "organizerId", "prizePool", "rules", "startDate", "status", "updatedAt" FROM "tournaments";
DROP TABLE "tournaments";
ALTER TABLE "new_tournaments" RENAME TO "tournaments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
