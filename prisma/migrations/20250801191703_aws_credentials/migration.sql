-- CreateTable
CREATE TABLE "public"."aws_credentials" (
    "id" TEXT NOT NULL,
    "encryptedAccessKeyId" TEXT NOT NULL,
    "encryptedSecretAccessKey" TEXT NOT NULL,
    "encryptedSessionToken" TEXT,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "aws_credentials_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."aws_credentials" ADD CONSTRAINT "aws_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
