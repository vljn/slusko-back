-- CreateTable
CREATE TABLE "Token" (
    "token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");
