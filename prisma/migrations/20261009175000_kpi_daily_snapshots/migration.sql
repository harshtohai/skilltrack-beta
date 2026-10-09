-- Materialized daily KPI snapshots (perf #1/#5): one row per
-- (snapshotDate, trainingCenterId). trainingCenterId NULL = org-wide
-- (admin scope); set = per-center (institute scope). Additive + idempotent
-- (IF NOT EXISTS) so it is safe to apply whether or not the table already
-- exists (the project historically used `prisma db push`).

CREATE TABLE IF NOT EXISTS "kpi_daily_snapshots" (
    "id" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "trainingCenterId" TEXT,
    "totalTrainees" INTEGER NOT NULL,
    "certified" INTEGER NOT NULL,
    "outcomeKnown" INTEGER NOT NULL,
    "employed" INTEGER NOT NULL,
    "verified" INTEGER NOT NULL,
    "conflicts" INTEGER NOT NULL,
    "followupsSent" INTEGER NOT NULL,
    "followupsResponded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_daily_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "kpi_daily_snapshots_snapshotDate_trainingCenterId_key" ON "kpi_daily_snapshots"("snapshotDate", "trainingCenterId");
