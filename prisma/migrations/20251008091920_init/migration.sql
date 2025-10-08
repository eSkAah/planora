-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'viewer');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('full_time', 'part_time', 'temporary', 'intern', 'freelance');

-- CreateEnum
CREATE TYPE "public"."ShiftType" AS ENUM ('morning', 'afternoon', 'evening', 'night', 'custom');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."GenerationMethod" AS ENUM ('manual', 'ai', 'template');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "sector" VARCHAR(50) NOT NULL,
    "size_category" VARCHAR(20) NOT NULL DEFAULT 'small',
    "legal_work_hours_per_week" INTEGER NOT NULL DEFAULT 35,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Europe/Paris',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'employee',
    "company_id" UUID NOT NULL,
    "avatar_url" TEXT,
    "phone" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "company_id" UUID NOT NULL,
    "employee_number" VARCHAR(20),
    "date_of_birth" DATE,
    "address" TEXT,
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(20),
    "hire_date" DATE NOT NULL,
    "department" VARCHAR(100),
    "position" VARCHAR(100),
    "manager_id" UUID,
    "max_hours_per_week" INTEGER NOT NULL DEFAULT 35,
    "max_consecutive_days" INTEGER NOT NULL DEFAULT 6,
    "min_rest_hours" INTEGER NOT NULL DEFAULT 11,
    "skills" TEXT[],
    "qualifications" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "availability" JSONB NOT NULL DEFAULT '{}',
    "shift_preferences" JSONB NOT NULL DEFAULT '{}',
    "unavailable_dates" JSONB NOT NULL DEFAULT '[]',
    "performance_rating" DECIMAL(3,2),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "termination_date" DATE,
    "termination_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "contract_type" "public"."ContractType" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "hours_per_week" DECIMAL(5,2) NOT NULL,
    "hours_per_day" DECIMAL(4,2),
    "days_per_week" INTEGER NOT NULL DEFAULT 5,
    "max_annual_hours" INTEGER,
    "current_annual_hours" INTEGER NOT NULL DEFAULT 0,
    "overtime_allowed" BOOLEAN NOT NULL DEFAULT true,
    "max_overtime_hours_per_week" INTEGER NOT NULL DEFAULT 0,
    "overtime_rate" DECIMAL(4,2) NOT NULL DEFAULT 1.25,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "signed_at" TIMESTAMPTZ(6),
    "effective_from" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shift_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "shift_type" "public"."ShiftType" NOT NULL,
    "color_code" VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "break_duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_paid_break" BOOLEAN NOT NULL DEFAULT true,
    "min_staff_required" INTEGER NOT NULL DEFAULT 1,
    "max_staff_allowed" INTEGER,
    "required_skills" TEXT[],
    "required_qualifications" JSONB NOT NULL DEFAULT '[]',
    "is_weekend_shift" BOOLEAN NOT NULL DEFAULT false,
    "is_holiday_shift" BOOLEAN NOT NULL DEFAULT false,
    "overtime_eligible" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_template" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "generated_by" UUID,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generation_method" "public"."GenerationMethod" NOT NULL DEFAULT 'ai',
    "ai_prompt" TEXT,
    "ai_constraints" JSONB NOT NULL DEFAULT '{}',
    "ai_optimization_goals" JSONB NOT NULL DEFAULT '[]',
    "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "published_by" UUID,
    "total_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "coverage_score" DECIMAL(5,2),
    "satisfaction_score" DECIMAL(5,2),
    "version" INTEGER NOT NULL DEFAULT 1,
    "previous_version_id" UUID,
    "notifications_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schedule_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "shift_template_id" UUID,
    "company_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "actual_start_time" TIME(6),
    "actual_end_time" TIME(6),
    "break_duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "break_start_time" TIME(6),
    "break_end_time" TIME(6),
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'scheduled',
    "confirmed_at" TIMESTAMPTZ(6),
    "confirmed_by" UUID,
    "actual_hours" DECIMAL(4,2),
    "is_overtime" BOOLEAN NOT NULL DEFAULT false,
    "overtime_hours" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "employee_notes" TEXT,
    "manager_notes" TEXT,
    "original_employee_id" UUID,
    "replacement_reason" TEXT,
    "replacement_requested_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedule_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "public"."companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "public"."employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_number_key" ON "public"."employees"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "shift_templates_company_id_name_key" ON "public"."shift_templates"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_assignments_employee_id_date_start_time_key" ON "public"."schedule_assignments"("employee_id", "date", "start_time");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shift_templates" ADD CONSTRAINT "shift_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "public"."schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_shift_template_id_fkey" FOREIGN KEY ("shift_template_id") REFERENCES "public"."shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_assignments" ADD CONSTRAINT "schedule_assignments_original_employee_id_fkey" FOREIGN KEY ("original_employee_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
