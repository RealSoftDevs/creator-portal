/*
  Warnings:

  - You are about to drop the column `theme` on the `Portal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Portal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Creator Portal',
    "bio" TEXT DEFAULT '',
    "avatar" TEXT,
    "templateId" TEXT NOT NULL DEFAULT 'template1',
    "primaryColor" TEXT NOT NULL DEFAULT '#000000',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ffffff',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Portal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Portal" ("avatar", "bio", "createdAt", "id", "primaryColor", "slug", "title", "updatedAt", "userId") SELECT "avatar", "bio", "createdAt", "id", "primaryColor", "slug", "title", "updatedAt", "userId" FROM "Portal";
DROP TABLE "Portal";
ALTER TABLE "new_Portal" RENAME TO "Portal";
CREATE UNIQUE INDEX "Portal_slug_key" ON "Portal"("slug");
CREATE UNIQUE INDEX "Portal_userId_key" ON "Portal"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "razorpayId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_razorpayId_key" ON "User"("razorpayId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
