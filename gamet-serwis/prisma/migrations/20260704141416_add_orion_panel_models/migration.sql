-- CreateTable
CREATE TABLE "Klient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Klient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WariantOrion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" "Color" NOT NULL,
    "opis" TEXT NOT NULL,
    "nT2" INTEGER NOT NULL DEFAULT 4,
    "nXF" INTEGER NOT NULL,
    "nXB" INTEGER NOT NULL,
    "nHF" INTEGER NOT NULL,
    "nHB" INTEGER NOT NULL,
    "nHS" INTEGER NOT NULL,
    "xrRed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WariantOrion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plyta" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plyta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lampa" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variantCode" TEXT NOT NULL,
    "color" "Color" NOT NULL,
    "voltage" TEXT NOT NULL,
    "lengthMm" INTEGER,
    "orderRef" TEXT,
    "customerId" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lampa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WariantOrion_code_key" ON "WariantOrion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Plyta_symbol_key" ON "Plyta"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Lampa_serialNumber_key" ON "Lampa"("serialNumber");

-- AddForeignKey
ALTER TABLE "Lampa" ADD CONSTRAINT "Lampa_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Klient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
