ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

CREATE TABLE "AuthAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key"
ON "AuthAccount"("provider", "providerAccountId");

CREATE INDEX "AuthAccount_userId_provider_idx"
ON "AuthAccount"("userId", "provider");

ALTER TABLE "AuthAccount"
ADD CONSTRAINT "AuthAccount_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
