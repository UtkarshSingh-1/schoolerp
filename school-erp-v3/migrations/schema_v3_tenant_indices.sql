-- SCHOOL ERP V3: PRODUCTION HARDENING - PHASE 3
-- Mandatory Tenant Isolation Indices

-- 1. Auth Service
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_email_school ON users(email, school_id);

-- 2. Student Service
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- 3. Teacher Service
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);

-- 4. Finance Service
CREATE INDEX IF NOT EXISTS idx_transactions_school_id ON transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_school ON transactions(idempotency_key, school_id);

-- 5. Exam Service
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_school_id ON exam_attempts(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_responses_attempt_id ON exam_responses(attempt_id); -- For quick lookup in submissions

-- 6. Audit & Logging
CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_school ON audit_logs(user_id, school_id);

-- 7. Notifications
CREATE INDEX IF NOT EXISTS idx_notification_logs_school_id ON notification_logs(school_id);

-- 8. Leave Service
CREATE INDEX IF NOT EXISTS idx_leave_requests_school_id ON leave_requests(school_id);

-- 9. Proctoring & Violations
CREATE INDEX IF NOT EXISTS idx_proctoring_events_school_id ON proctoring_events(school_id);
CREATE INDEX IF NOT EXISTS idx_violation_records_school_id ON violation_records(school_id);
