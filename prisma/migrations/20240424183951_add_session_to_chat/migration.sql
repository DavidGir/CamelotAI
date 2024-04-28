/*
  Warnings:

  - Added the required column `sessionId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "sessionId" TEXT NOT NULL,
ALTER COLUMN "document_id" DROP NOT NULL;
