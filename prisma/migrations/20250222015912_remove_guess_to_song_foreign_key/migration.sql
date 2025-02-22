/*
  Warnings:

  - You are about to drop the column `submittedSongId` on the `Guess` table. All the data in the column will be lost.
  - Added the required column `submittedSpotifyId` to the `Guess` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Guess" DROP CONSTRAINT "Guess_submittedSongId_fkey";

-- AlterTable
ALTER TABLE "Guess" DROP COLUMN "submittedSongId",
ADD COLUMN     "submittedSpotifyId" INTEGER NOT NULL;
