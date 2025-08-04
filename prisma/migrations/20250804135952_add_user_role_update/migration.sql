/*
  Warnings:

  - You are about to drop the `userroleaws` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."userroleaws" DROP CONSTRAINT "userroleaws_userId_fkey";

-- DropTable
DROP TABLE "public"."userroleaws";

-- CreateTable
CREATE TABLE "public"."UserRoleAWS" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awsRoleARN" TEXT NOT NULL,
    "region" TEXT NOT NULL,

    CONSTRAINT "UserRoleAWS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAWS_userId_key" ON "public"."UserRoleAWS"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserRoleAWS" ADD CONSTRAINT "UserRoleAWS_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
