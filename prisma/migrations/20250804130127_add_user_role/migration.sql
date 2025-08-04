-- CreateTable
CREATE TABLE "public"."userroleaws" (
    "id" TEXT NOT NULL,
    "awsRoleARN" TEXT,
    "region" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "userroleaws_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userroleaws_userId_key" ON "public"."userroleaws"("userId");

-- AddForeignKey
ALTER TABLE "public"."userroleaws" ADD CONSTRAINT "userroleaws_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
