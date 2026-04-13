-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "buyLink" TEXT NOT NULL,
    "price" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'custom',
    "order" INTEGER NOT NULL DEFAULT 0,
    "portalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
