/*
  Warnings:

  - You are about to drop the `vibeguard_findings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vibeguard_fix_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vibeguard_pull_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vibeguard_repo_connections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vibeguard_scan_runs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "vibeguard_findings" DROP CONSTRAINT "vibeguard_findings_scanRunId_fkey";

-- DropForeignKey
ALTER TABLE "vibeguard_fix_plans" DROP CONSTRAINT "vibeguard_fix_plans_scanRunId_fkey";

-- DropForeignKey
ALTER TABLE "vibeguard_pull_requests" DROP CONSTRAINT "vibeguard_pull_requests_fixPlanId_fkey";

-- DropForeignKey
ALTER TABLE "vibeguard_scan_runs" DROP CONSTRAINT "vibeguard_scan_runs_repoConnectionId_fkey";

-- DropTable
DROP TABLE "vibeguard_findings";

-- DropTable
DROP TABLE "vibeguard_fix_plans";

-- DropTable
DROP TABLE "vibeguard_pull_requests";

-- DropTable
DROP TABLE "vibeguard_repo_connections";

-- DropTable
DROP TABLE "vibeguard_scan_runs";
