-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "GitEventType" AS ENUM ('commit', 'pull_request', 'review');

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total_items" INTEGER,
    "processed_items" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "error_details" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "owner_login" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL,
    "default_branch" TEXT,
    "primary_language" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "import_job_id" TEXT,
    "external_id" TEXT NOT NULL,
    "event_type" "GitEventType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "lines_added" INTEGER NOT NULL,
    "lines_removed" INTEGER NOT NULL,
    "files_changed" INTEGER NOT NULL,
    "languages" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "git_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_import_jobs_user_id" ON "import_jobs"("user_id");

-- CreateIndex
CREATE INDEX "idx_repositories_user_id" ON "repositories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_user_id_external_id_key" ON "repositories"("user_id", "external_id");

-- CreateIndex
CREATE INDEX "idx_git_events_user_id_occurred_at" ON "git_events"("user_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "git_events_user_id_external_id_key" ON "git_events"("user_id", "external_id");

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_events" ADD CONSTRAINT "git_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_events" ADD CONSTRAINT "git_events_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_events" ADD CONSTRAINT "git_events_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
