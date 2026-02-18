-- CreateTable
CREATE TABLE "RepoPreference" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepoPreference_userId_idx" ON "RepoPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RepoPreference_userId_repoName_key" ON "RepoPreference"("userId", "repoName");

-- AddForeignKey
ALTER TABLE "RepoPreference" ADD CONSTRAINT "RepoPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
