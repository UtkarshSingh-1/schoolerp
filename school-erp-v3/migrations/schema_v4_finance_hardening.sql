-- Phase 5: Finance Integrity Level 2
-- Migration to introduce Wallets and enforce database-level idempotency

-- 1. Create Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    student_id UUID NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add Unique Constraint for Wallet (One wallet per student per school)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_school_student ON wallets (school_id, student_id);

-- 3. Enforce Unique Idempotency on Transactions
-- Note: We use a partial index if we want to allow null idempotency keys, but here we enforce uniqueness.
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_school_idempotency ON transactions (school_id, idempotency_key);

-- 4. Audit Log Indices for Performance
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions (student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions (created_by);
