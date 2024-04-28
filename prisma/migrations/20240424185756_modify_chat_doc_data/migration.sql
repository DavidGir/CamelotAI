/*
  Warnings:

  - Made the column `document_id` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "document_id" SET NOT NULL;
