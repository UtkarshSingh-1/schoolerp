-- =========================
-- INITIAL ROLES
-- =========================
INSERT INTO roles (name) VALUES 
('SUPER_ADMIN'),
('ADMIN'),
('TEACHER'),
('ACCOUNTANT'),
('HR_MANAGER'),
('STUDENT'),
('PARENT')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- INITIAL PERMISSIONS (Samples)
-- =========================
INSERT INTO permissions (name) VALUES 
('MANAGE_USERS'),
('MANAGE_ADMISSION'),
('MARK_ATTENDANCE'),
('VIEW_REPORTS'),
('MANAGE_FEES'),
('MANAGE_PAYROLL')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- DEFAULT ADMIN USER
-- (Password: admin123)
-- Hash generated for demo purposes
-- =========================
INSERT INTO users (role_id, first_name, last_name, email, password_hash)
SELECT id, 'Super', 'Admin', 'admin@school.erp', '$2b$10$X86pYgW2uL3qN3v9gQ2Zue6i8W5m1k7H2W5q6k7H2W5q6k7H2W5q6'
FROM roles WHERE name = 'SUPER_ADMIN'
ON CONFLICT (email) DO NOTHING;
