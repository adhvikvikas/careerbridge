-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'CONTRACT');

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME';
