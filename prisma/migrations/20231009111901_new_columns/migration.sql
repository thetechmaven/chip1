/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPhoneVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pwHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "country",
DROP COLUMN "isEmailVerified",
DROP COLUMN "isPhoneVerified",
DROP COLUMN "pwHash",
DROP COLUMN "state",
ADD COLUMN     "categoryPreference" TEXT[],
ADD COLUMN     "citizenship" TEXT,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "locationPreference" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "race" TEXT;
