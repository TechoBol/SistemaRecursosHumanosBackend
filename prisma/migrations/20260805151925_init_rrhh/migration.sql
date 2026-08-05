-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDEFINITE', 'CONSULTING');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'GENERATED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmployeeDocumentType" AS ENUM ('RESUME', 'IDENTITY_DOCUMENT', 'CONTRACT', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "MemorandumType" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "AttendanceIncidentType" AS ENUM ('PERMISSION', 'ABSENCE');

-- CreateEnum
CREATE TYPE "AttendanceDurationType" AS ENUM ('HOURS', 'HALF_DAY', 'FULL_DAY');

-- CreateEnum
CREATE TYPE "EmployeeMovementType" AS ENUM ('BONUS', 'DISCOUNT', 'ADVANCE');

-- CreateEnum
CREATE TYPE "EmployeeMovementStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TerminationType" AS ENUM ('RESIGNATION', 'DISMISSAL', 'CONTRACT_END', 'MUTUAL_AGREEMENT', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "legal_name" VARCHAR(180),
    "tax_id" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "address" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_branches" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_titles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_job_titles" (
    "id" SERIAL NOT NULL,
    "area_id" INTEGER NOT NULL,
    "job_title_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_job_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL DEFAULT '',
    "last_name" VARCHAR(100) NOT NULL DEFAULT '',
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_access_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "first_names" VARCHAR(120) NOT NULL,
    "last_names" VARCHAR(160) NOT NULL,
    "document_number" VARCHAR(30) NOT NULL,
    "birth_date" DATE,
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "address" VARCHAR(255),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_contracts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_company_id" INTEGER NOT NULL,
    "consolidated_company_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "job_title_id" INTEGER NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "hire_date" DATE NOT NULL,
    "end_date" DATE,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "relationship" VARCHAR(60) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "address" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "document_type" "EmployeeDocumentType" NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "document_date" DATE,
    "notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorandums" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "type" "MemorandumType" NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "category" VARCHAR(100),
    "memorandum_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "file_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorandums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_incidents" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "type" "AttendanceIncidentType" NOT NULL,
    "duration_type" "AttendanceDurationType" NOT NULL,
    "incident_date" DATE NOT NULL,
    "reason" VARCHAR(180),
    "description" TEXT,
    "is_justified" BOOLEAN NOT NULL DEFAULT false,
    "attachment_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacations" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "days" DECIMAL(5,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_movements" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "type" "EmployeeMovementType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "movement_date" DATE NOT NULL,
    "description" TEXT,
    "status" "EmployeeMovementStatus" NOT NULL DEFAULT 'PENDING',
    "applied_year" INTEGER,
    "applied_month" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payrolls" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_company_id" INTEGER NOT NULL,
    "consolidated_company_id" INTEGER NOT NULL,
    "generated_by_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "worked_days" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "earned_salary" DECIMAL(12,2) NOT NULL,
    "seniority_bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "other_bonuses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discounts" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "advances" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "afp_deduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(12,2) NOT NULL,
    "total_deductions" DECIMAL(12,2) NOT NULL,
    "net_salary" DECIMAL(12,2) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminations" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "registered_by_user_id" INTEGER NOT NULL,
    "type" "TerminationType" NOT NULL,
    "termination_date" DATE NOT NULL,
    "reason" VARCHAR(180),
    "description" TEXT,
    "settlement_amount" DECIMAL(12,2),
    "document_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terminations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_id_key" ON "companies"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE INDEX "company_branches_branch_id_idx" ON "company_branches"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_branches_company_id_branch_id_key" ON "company_branches"("company_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_titles_name_key" ON "job_titles"("name");

-- CreateIndex
CREATE INDEX "area_job_titles_area_id_idx" ON "area_job_titles"("area_id");

-- CreateIndex
CREATE INDEX "area_job_titles_job_title_id_idx" ON "area_job_titles"("job_title_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_job_titles_area_id_job_title_id_key" ON "area_job_titles"("area_id", "job_title_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_document_number_key" ON "employees"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employee_contracts_employee_id_idx" ON "employee_contracts"("employee_id");

-- CreateIndex
CREATE INDEX "employee_contracts_employee_id_is_active_idx" ON "employee_contracts"("employee_id", "is_active");

-- CreateIndex
CREATE INDEX "employee_contracts_contract_company_id_idx" ON "employee_contracts"("contract_company_id");

-- CreateIndex
CREATE INDEX "employee_contracts_consolidated_company_id_idx" ON "employee_contracts"("consolidated_company_id");

-- CreateIndex
CREATE INDEX "employee_contracts_branch_id_idx" ON "employee_contracts"("branch_id");

-- CreateIndex
CREATE INDEX "employee_contracts_area_id_idx" ON "employee_contracts"("area_id");

-- CreateIndex
CREATE INDEX "employee_contracts_job_title_id_idx" ON "employee_contracts"("job_title_id");

-- CreateIndex
CREATE INDEX "employee_contracts_status_idx" ON "employee_contracts"("status");

-- CreateIndex
CREATE INDEX "emergency_contacts_employee_id_idx" ON "emergency_contacts"("employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_employee_id_idx" ON "employee_documents"("employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_document_type_idx" ON "employee_documents"("document_type");

-- CreateIndex
CREATE INDEX "memorandums_employee_id_idx" ON "memorandums"("employee_id");

-- CreateIndex
CREATE INDEX "memorandums_created_by_id_idx" ON "memorandums"("created_by_id");

-- CreateIndex
CREATE INDEX "memorandums_type_idx" ON "memorandums"("type");

-- CreateIndex
CREATE INDEX "attendance_incidents_employee_id_idx" ON "attendance_incidents"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_incidents_incident_date_idx" ON "attendance_incidents"("incident_date");

-- CreateIndex
CREATE INDEX "attendance_incidents_type_idx" ON "attendance_incidents"("type");

-- CreateIndex
CREATE INDEX "vacations_employee_id_idx" ON "vacations"("employee_id");

-- CreateIndex
CREATE INDEX "vacations_start_date_idx" ON "vacations"("start_date");

-- CreateIndex
CREATE INDEX "vacations_status_idx" ON "vacations"("status");

-- CreateIndex
CREATE INDEX "employee_movements_employee_id_idx" ON "employee_movements"("employee_id");

-- CreateIndex
CREATE INDEX "employee_movements_type_idx" ON "employee_movements"("type");

-- CreateIndex
CREATE INDEX "employee_movements_status_idx" ON "employee_movements"("status");

-- CreateIndex
CREATE INDEX "employee_movements_applied_year_applied_month_idx" ON "employee_movements"("applied_year", "applied_month");

-- CreateIndex
CREATE INDEX "employee_payrolls_contract_company_id_year_month_idx" ON "employee_payrolls"("contract_company_id", "year", "month");

-- CreateIndex
CREATE INDEX "employee_payrolls_consolidated_company_id_year_month_idx" ON "employee_payrolls"("consolidated_company_id", "year", "month");

-- CreateIndex
CREATE INDEX "employee_payrolls_status_idx" ON "employee_payrolls"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_payrolls_employee_id_year_month_key" ON "employee_payrolls"("employee_id", "year", "month");

-- CreateIndex
CREATE INDEX "terminations_employee_id_idx" ON "terminations"("employee_id");

-- CreateIndex
CREATE INDEX "terminations_contract_id_idx" ON "terminations"("contract_id");

-- CreateIndex
CREATE INDEX "terminations_registered_by_user_id_idx" ON "terminations"("registered_by_user_id");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_job_titles" ADD CONSTRAINT "area_job_titles_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_job_titles" ADD CONSTRAINT "area_job_titles_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_contract_company_id_fkey" FOREIGN KEY ("contract_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_consolidated_company_id_fkey" FOREIGN KEY ("consolidated_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorandums" ADD CONSTRAINT "memorandums_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorandums" ADD CONSTRAINT "memorandums_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_incidents" ADD CONSTRAINT "attendance_incidents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_movements" ADD CONSTRAINT "employee_movements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_contract_company_id_fkey" FOREIGN KEY ("contract_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_consolidated_company_id_fkey" FOREIGN KEY ("consolidated_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "employee_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_registered_by_user_id_fkey" FOREIGN KEY ("registered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
