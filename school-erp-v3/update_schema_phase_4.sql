-- Phase 4 Schema Updates: Financials
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_frequency') THEN
        CREATE TYPE fee_frequency AS ENUM ('ONCE', 'MONTHLY', 'QUARTERLY', 'YEARLY');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('FEE_PAYMENT', 'PAYROLL', 'GENERAL');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    frequency fee_frequency DEFAULT 'MONTHLY',
    grade_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    student_id UUID NOT NULL,
    fee_structure_id UUID NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    is_fully_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fee_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id)
);

-- Hardening Transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type transaction_type DEFAULT 'GENERAL',
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Payroll Tables
CREATE TABLE IF NOT EXISTS salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) DEFAULT 0,
    deductions DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    salary_structure_id UUID NOT NULL,
    month VARCHAR(10) NOT NULL,
    net_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salary_struct FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(id)
);
