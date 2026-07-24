-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('OPEN', 'PROCESSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayrollCriteria" AS ENUM ('CONTRACTING_COMPANY', 'CONSOLIDATED_COMPANY');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'GENERATED', 'APPROVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollConceptType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkIncidentCategory" AS ENUM ('PERMISSION', 'ABSENCE', 'DELAY', 'LEAVE', 'SICK_LEAVE');

-- CreateEnum
CREATE TYPE "WorkIncidentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MemorandumStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalaryAdvanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalaryAdvanceInstallmentStatus" AS ENUM ('PENDING', 'DEDUCTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalaryEventCategory" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "SalaryEventStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

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
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "state" VARCHAR(100),
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
CREATE TABLE "company_areas" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_areas_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "company_job_titles" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "job_title_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_job_titles_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "relationship" VARCHAR(60) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "secondary_phone" VARCHAR(30),
    "address" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_contracts" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contracting_company_id" INTEGER NOT NULL,
    "contract_type_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "document_url" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_assignments" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "consolidated_company_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "job_title_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_history" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'BOB',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "change_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_access_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" SERIAL NOT NULL,
    "payroll_period_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "criteria" "PayrollCriteria" NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "generated_by_user_id" INTEGER NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_details" (
    "id" SERIAL NOT NULL,
    "payroll_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "work_assignment_id" INTEGER NOT NULL,
    "base_salary" DECIMAL(12,2) NOT NULL,
    "worked_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_concepts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "PayrollConceptType" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_detail_concepts" (
    "id" SERIAL NOT NULL,
    "payroll_detail_id" INTEGER NOT NULL,
    "payroll_concept_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_detail_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_balances" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "assigned_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "used_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "available_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_requests" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "number_of_days" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_employee_id" INTEGER,
    "response_date" TIMESTAMP(3),
    "response_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_incident_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" "WorkIncidentCategory" NOT NULL,
    "deducts_salary" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_incident_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_incidents" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "work_incident_type_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "number_of_hours" DECIMAL(6,2),
    "number_of_days" DECIMAL(5,2),
    "reason" TEXT,
    "status" "WorkIncidentStatus" NOT NULL DEFAULT 'PENDING',
    "deduction_amount" DECIMAL(12,2),
    "approved_by_employee_id" INTEGER,
    "document_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorandum_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorandum_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorandums" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "memorandum_type_id" INTEGER NOT NULL,
    "issue_date" DATE NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "issued_by_employee_id" INTEGER,
    "document_url" VARCHAR(500),
    "status" "MemorandumStatus" NOT NULL DEFAULT 'ISSUED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorandums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_advances" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "request_date" DATE NOT NULL,
    "requested_amount" DECIMAL(12,2) NOT NULL,
    "approved_amount" DECIMAL(12,2),
    "number_of_installments" INTEGER,
    "reason" TEXT,
    "status" "SalaryAdvanceStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_employee_id" INTEGER,
    "approval_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_advance_installments" (
    "id" SERIAL NOT NULL,
    "salary_advance_id" INTEGER NOT NULL,
    "payroll_period_id" INTEGER,
    "installment_number" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "SalaryAdvanceInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_advance_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_event_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" "SalaryEventCategory" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_events" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "salary_event_type_id" INTEGER NOT NULL,
    "payroll_period_id" INTEGER,
    "event_date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "status" "SalaryEventStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminations" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "termination_date" DATE NOT NULL,
    "termination_type" VARCHAR(60) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "document_url" VARCHAR(500),
    "registered_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terminations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_id_key" ON "companies"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_state_address_key" ON "branches"("name", "state", "address");

-- CreateIndex
CREATE INDEX "company_branches_branch_id_idx" ON "company_branches"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_branches_company_id_branch_id_key" ON "company_branches"("company_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE INDEX "company_areas_area_id_idx" ON "company_areas"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_areas_company_id_area_id_key" ON "company_areas"("company_id", "area_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_titles_name_key" ON "job_titles"("name");

-- CreateIndex
CREATE INDEX "company_job_titles_job_title_id_idx" ON "company_job_titles"("job_title_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_job_titles_company_id_job_title_id_key" ON "company_job_titles"("company_id", "job_title_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_document_number_key" ON "employees"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "emergency_contacts_employee_id_idx" ON "emergency_contacts"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_types_name_key" ON "contract_types"("name");

-- CreateIndex
CREATE INDEX "employee_contracts_employee_id_idx" ON "employee_contracts"("employee_id");

-- CreateIndex
CREATE INDEX "employee_contracts_contracting_company_id_status_idx" ON "employee_contracts"("contracting_company_id", "status");

-- CreateIndex
CREATE INDEX "employee_contracts_contract_type_id_idx" ON "employee_contracts"("contract_type_id");

-- CreateIndex
CREATE INDEX "work_assignments_employee_id_is_current_idx" ON "work_assignments"("employee_id", "is_current");

-- CreateIndex
CREATE INDEX "work_assignments_consolidated_company_id_is_current_idx" ON "work_assignments"("consolidated_company_id", "is_current");

-- CreateIndex
CREATE INDEX "work_assignments_branch_id_idx" ON "work_assignments"("branch_id");

-- CreateIndex
CREATE INDEX "work_assignments_area_id_idx" ON "work_assignments"("area_id");

-- CreateIndex
CREATE INDEX "work_assignments_job_title_id_idx" ON "work_assignments"("job_title_id");

-- CreateIndex
CREATE INDEX "salary_history_employee_id_is_current_idx" ON "salary_history"("employee_id", "is_current");

-- CreateIndex
CREATE INDEX "salary_history_contract_id_idx" ON "salary_history"("contract_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_year_month_key" ON "payroll_periods"("year", "month");

-- CreateIndex
CREATE INDEX "payrolls_company_id_criteria_idx" ON "payrolls"("company_id", "criteria");

-- CreateIndex
CREATE INDEX "payrolls_generated_by_user_id_idx" ON "payrolls"("generated_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_payroll_period_id_company_id_criteria_key" ON "payrolls"("payroll_period_id", "company_id", "criteria");

-- CreateIndex
CREATE INDEX "payroll_details_employee_id_idx" ON "payroll_details"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_details_contract_id_idx" ON "payroll_details"("contract_id");

-- CreateIndex
CREATE INDEX "payroll_details_work_assignment_id_idx" ON "payroll_details"("work_assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_details_payroll_id_employee_id_key" ON "payroll_details"("payroll_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_concepts_name_key" ON "payroll_concepts"("name");

-- CreateIndex
CREATE INDEX "payroll_detail_concepts_payroll_concept_id_idx" ON "payroll_detail_concepts"("payroll_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_detail_concepts_payroll_detail_id_payroll_concept_i_key" ON "payroll_detail_concepts"("payroll_detail_id", "payroll_concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_balances_employee_id_year_key" ON "vacation_balances"("employee_id", "year");

-- CreateIndex
CREATE INDEX "vacation_requests_employee_id_status_idx" ON "vacation_requests"("employee_id", "status");

-- CreateIndex
CREATE INDEX "vacation_requests_approved_by_employee_id_idx" ON "vacation_requests"("approved_by_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_incident_types_name_key" ON "work_incident_types"("name");

-- CreateIndex
CREATE INDEX "work_incidents_employee_id_status_idx" ON "work_incidents"("employee_id", "status");

-- CreateIndex
CREATE INDEX "work_incidents_work_incident_type_id_idx" ON "work_incidents"("work_incident_type_id");

-- CreateIndex
CREATE INDEX "work_incidents_approved_by_employee_id_idx" ON "work_incidents"("approved_by_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "memorandum_types_name_key" ON "memorandum_types"("name");

-- CreateIndex
CREATE INDEX "memorandums_employee_id_idx" ON "memorandums"("employee_id");

-- CreateIndex
CREATE INDEX "memorandums_memorandum_type_id_idx" ON "memorandums"("memorandum_type_id");

-- CreateIndex
CREATE INDEX "memorandums_issued_by_employee_id_idx" ON "memorandums"("issued_by_employee_id");

-- CreateIndex
CREATE INDEX "salary_advances_employee_id_status_idx" ON "salary_advances"("employee_id", "status");

-- CreateIndex
CREATE INDEX "salary_advances_approved_by_employee_id_idx" ON "salary_advances"("approved_by_employee_id");

-- CreateIndex
CREATE INDEX "salary_advance_installments_payroll_period_id_idx" ON "salary_advance_installments"("payroll_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "salary_advance_installments_salary_advance_id_installment_n_key" ON "salary_advance_installments"("salary_advance_id", "installment_number");

-- CreateIndex
CREATE UNIQUE INDEX "salary_event_types_name_key" ON "salary_event_types"("name");

-- CreateIndex
CREATE INDEX "salary_events_employee_id_status_idx" ON "salary_events"("employee_id", "status");

-- CreateIndex
CREATE INDEX "salary_events_salary_event_type_id_idx" ON "salary_events"("salary_event_type_id");

-- CreateIndex
CREATE INDEX "salary_events_payroll_period_id_idx" ON "salary_events"("payroll_period_id");

-- CreateIndex
CREATE INDEX "terminations_employee_id_idx" ON "terminations"("employee_id");

-- CreateIndex
CREATE INDEX "terminations_contract_id_idx" ON "terminations"("contract_id");

-- CreateIndex
CREATE INDEX "terminations_registered_by_user_id_idx" ON "terminations"("registered_by_user_id");

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_areas" ADD CONSTRAINT "company_areas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_areas" ADD CONSTRAINT "company_areas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_job_titles" ADD CONSTRAINT "company_job_titles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_job_titles" ADD CONSTRAINT "company_job_titles_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_contracting_company_id_fkey" FOREIGN KEY ("contracting_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contracts" ADD CONSTRAINT "employee_contracts_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "contract_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_assignments" ADD CONSTRAINT "work_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_assignments" ADD CONSTRAINT "work_assignments_consolidated_company_id_fkey" FOREIGN KEY ("consolidated_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_assignments" ADD CONSTRAINT "work_assignments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_assignments" ADD CONSTRAINT "work_assignments_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_assignments" ADD CONSTRAINT "work_assignments_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_history" ADD CONSTRAINT "salary_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_history" ADD CONSTRAINT "salary_history_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "employee_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_generated_by_user_id_fkey" FOREIGN KEY ("generated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "employee_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_work_assignment_id_fkey" FOREIGN KEY ("work_assignment_id") REFERENCES "work_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_detail_concepts" ADD CONSTRAINT "payroll_detail_concepts_payroll_detail_id_fkey" FOREIGN KEY ("payroll_detail_id") REFERENCES "payroll_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_detail_concepts" ADD CONSTRAINT "payroll_detail_concepts_payroll_concept_id_fkey" FOREIGN KEY ("payroll_concept_id") REFERENCES "payroll_concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_balances" ADD CONSTRAINT "vacation_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_requests" ADD CONSTRAINT "vacation_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_requests" ADD CONSTRAINT "vacation_requests_approved_by_employee_id_fkey" FOREIGN KEY ("approved_by_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_incidents" ADD CONSTRAINT "work_incidents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_incidents" ADD CONSTRAINT "work_incidents_work_incident_type_id_fkey" FOREIGN KEY ("work_incident_type_id") REFERENCES "work_incident_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_incidents" ADD CONSTRAINT "work_incidents_approved_by_employee_id_fkey" FOREIGN KEY ("approved_by_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorandums" ADD CONSTRAINT "memorandums_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorandums" ADD CONSTRAINT "memorandums_memorandum_type_id_fkey" FOREIGN KEY ("memorandum_type_id") REFERENCES "memorandum_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorandums" ADD CONSTRAINT "memorandums_issued_by_employee_id_fkey" FOREIGN KEY ("issued_by_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advances" ADD CONSTRAINT "salary_advances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advances" ADD CONSTRAINT "salary_advances_approved_by_employee_id_fkey" FOREIGN KEY ("approved_by_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advance_installments" ADD CONSTRAINT "salary_advance_installments_salary_advance_id_fkey" FOREIGN KEY ("salary_advance_id") REFERENCES "salary_advances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_advance_installments" ADD CONSTRAINT "salary_advance_installments_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_events" ADD CONSTRAINT "salary_events_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_events" ADD CONSTRAINT "salary_events_salary_event_type_id_fkey" FOREIGN KEY ("salary_event_type_id") REFERENCES "salary_event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_events" ADD CONSTRAINT "salary_events_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "employee_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminations" ADD CONSTRAINT "terminations_registered_by_user_id_fkey" FOREIGN KEY ("registered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
