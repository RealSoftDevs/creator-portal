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
    "backgroundType" TEXT NOT NULL DEFAULT 'color',
    "gradientStart" TEXT DEFAULT '#000000',
    "gradientEnd" TEXT DEFAULT '#ffffff',
    "backgroundImage" TEXT,
    "textColor" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'font-sans',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publicTemplateId" TEXT NOT NULL DEFAULT 'template1',
    "publicPrimaryColor" TEXT NOT NULL DEFAULT '#000000',
    "publicBackgroundType" TEXT NOT NULL DEFAULT 'color',
    "publicGradientStart" TEXT,
    "publicGradientEnd" TEXT,
    "publicBackgroundImage" TEXT,
    "publicTextColor" TEXT,
    "publicFontFamily" TEXT NOT NULL DEFAULT 'font-sans',
    "adminTemplateId" TEXT DEFAULT 'template1',
    "adminPrimaryColor" TEXT DEFAULT '#000000',
    "adminBackgroundType" TEXT DEFAULT 'color',
    "adminGradientStart" TEXT,
    "adminGradientEnd" TEXT,
    "adminBackgroundImage" TEXT,
    "adminTextColor" TEXT,
    "adminFontFamily" TEXT DEFAULT 'font-sans',
    CONSTRAINT "Portal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Portal" ("avatar", "backgroundImage", "backgroundType", "bio", "createdAt", "fontFamily", "gradientEnd", "gradientStart", "id", "primaryColor", "slug", "templateId", "textColor", "title", "updatedAt", "userId") SELECT "avatar", "backgroundImage", "backgroundType", "bio", "createdAt", "fontFamily", "gradientEnd", "gradientStart", "id", "primaryColor", "slug", "templateId", "textColor", "title", "updatedAt", "userId" FROM "Portal";
DROP TABLE "Portal";
ALTER TABLE "new_Portal" RENAME TO "Portal";
CREATE UNIQUE INDEX "Portal_slug_key" ON "Portal"("slug");
CREATE UNIQUE INDEX "Portal_userId_key" ON "Portal"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
