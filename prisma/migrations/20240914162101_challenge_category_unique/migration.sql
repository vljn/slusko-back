/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,date]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Challenge_categoryId_date_key" ON "Challenge"("categoryId", "date");
