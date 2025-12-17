/*
  Warnings:

  - You are about to drop the column `createdAt` on the `registrations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
