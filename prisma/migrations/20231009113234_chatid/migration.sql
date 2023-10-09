/*
  Warnings:

  - Added the required column `chatId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatId" INTEGER NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
