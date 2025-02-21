/*
  Warnings:

  - You are about to drop the column `date` on the `Challenge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId,startDate,endDate]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Challenge_categoryId_date_key";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_categoryId_startDate_endDate_key" ON "Challenge"("categoryId", "startDate", "endDate");
