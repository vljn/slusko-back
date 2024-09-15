-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "maxGuesses" INTEGER NOT NULL DEFAULT 6;

-- CreateTable
CREATE TABLE "Guess" (
    "id" SERIAL NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "submittedSongId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_submittedSongId_fkey" FOREIGN KEY ("submittedSongId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
