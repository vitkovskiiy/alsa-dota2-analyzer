-- CreateTable
CREATE TABLE "Hero" (
    "id"        SERIAL   NOT NULL,
    "name"      TEXT     NOT NULL,
    "role"      TEXT     NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id"         SERIAL   NOT NULL,
    "externalId" TEXT     NOT NULL,
    "winnerSide" TEXT     NOT NULL,
    "duration"   INTEGER  NOT NULL,
    "playedAt"   TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchHero" (
    "id"      SERIAL   NOT NULL,
    "matchId" INTEGER  NOT NULL,
    "heroId"  INTEGER  NOT NULL,
    "side"    TEXT     NOT NULL,
    "won"     BOOLEAN  NOT NULL,
    CONSTRAINT "MatchHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroPair" (
    "id"         SERIAL  NOT NULL,
    "hero1Id"    INTEGER NOT NULL,
    "hero2Id"    INTEGER NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "wins"       INTEGER NOT NULL DEFAULT 0,
    "winRate"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "HeroPair_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Hero_name_key"      ON "Hero"("name");
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");
CREATE UNIQUE INDEX "MatchHero_matchId_heroId_key" ON "MatchHero"("matchId", "heroId");
CREATE UNIQUE INDEX "HeroPair_hero1Id_hero2Id_key" ON "HeroPair"("hero1Id", "hero2Id");

-- CreateIndex
CREATE INDEX "MatchHero_heroId_idx" ON "MatchHero"("heroId");
CREATE INDEX "HeroPair_hero1Id_idx" ON "HeroPair"("hero1Id");
CREATE INDEX "HeroPair_hero2Id_idx" ON "HeroPair"("hero2Id");

-- AddForeignKey
ALTER TABLE "MatchHero" ADD CONSTRAINT "MatchHero_matchId_fkey"
    FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MatchHero" ADD CONSTRAINT "MatchHero_heroId_fkey"
    FOREIGN KEY ("heroId") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HeroPair" ADD CONSTRAINT "HeroPair_hero1Id_fkey"
    FOREIGN KEY ("hero1Id") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HeroPair" ADD CONSTRAINT "HeroPair_hero2Id_fkey"
    FOREIGN KEY ("hero2Id") REFERENCES "Hero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
