-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "razorpayId" TEXT,
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portal" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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

    CONSTRAINT "Portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "wrappedUrl" TEXT,
    "imageUrl" TEXT,
    "iconType" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "device" TEXT,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "buyLink" TEXT NOT NULL,
    "price" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'custom',
    "order" INTEGER NOT NULL DEFAULT 0,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_razorpayId_key" ON "User"("razorpayId");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_slug_key" ON "Portal"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_userId_key" ON "Portal"("userId");

-- AddForeignKey
ALTER TABLE "Portal" ADD CONSTRAINT "Portal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
