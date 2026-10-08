-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('MEETING', 'REMINDER', 'DELIVERY', 'INTERNAL', 'OTHER');

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CalendarEventType" NOT NULL DEFAULT 'MEETING',
    "start_date_time" TIMESTAMP(3) NOT NULL,
    "end_date_time" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "created_by_id" UUID,
    "assigned_to_id" UUID,
    "client_id" UUID,
    "project_id" UUID,
    "task_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_events_organization_id_start_date_time_idx" ON "calendar_events"("organization_id", "start_date_time");

-- CreateIndex
CREATE INDEX "calendar_events_organization_id_assigned_to_id_start_date_t_idx" ON "calendar_events"("organization_id", "assigned_to_id", "start_date_time");

-- CreateIndex
CREATE INDEX "calendar_events_organization_id_project_id_idx" ON "calendar_events"("organization_id", "project_id");

-- CreateIndex
CREATE INDEX "calendar_events_organization_id_client_id_idx" ON "calendar_events"("organization_id", "client_id");

-- CreateIndex
CREATE INDEX "calendar_events_organization_id_task_id_idx" ON "calendar_events"("organization_id", "task_id");

-- CreateIndex
CREATE INDEX "calendar_events_created_by_id_idx" ON "calendar_events"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_id_organization_id_key" ON "tasks"("id", "organization_id");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_assigned_to_id_organization_id_fkey" FOREIGN KEY ("assigned_to_id", "organization_id") REFERENCES "memberships"("user_id", "organization_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_client_id_organization_id_fkey" FOREIGN KEY ("client_id", "organization_id") REFERENCES "clients"("id", "organization_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_project_id_organization_id_fkey" FOREIGN KEY ("project_id", "organization_id") REFERENCES "projects"("id", "organization_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_task_id_organization_id_fkey" FOREIGN KEY ("task_id", "organization_id") REFERENCES "tasks"("id", "organization_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- Database-level backstop for the "end after start" rule (Prisma does not model CHECK constraints).
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_end_after_start_check" CHECK ("end_date_time" > "start_date_time");
