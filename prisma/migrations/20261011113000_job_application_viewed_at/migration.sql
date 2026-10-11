-- "Viewed" application state (quick-wins #88): the employer's applicants-panel
-- expand marks applications viewed; nullable = not yet seen.
ALTER TABLE "job_applications" ADD COLUMN "viewedAt" TIMESTAMP(3);
