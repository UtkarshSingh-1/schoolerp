-- =========================
-- USERS & RBAC
-- =========================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash TEXT NOT NULL,
    must_change_password BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- STUDENTS & ADMISSION
-- =========================

CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    dob DATE,
    phone VARCHAR(20),
    email VARCHAR(150),
    applied_class VARCHAR(20),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entrance_exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    total_marks INT,
    exam_date DATE
);

CREATE TABLE exam_questions (
    id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES entrance_exams(id) ON DELETE CASCADE,
    question TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1)
);

CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    applicant_id INT REFERENCES applicants(id) ON DELETE CASCADE,
    exam_id INT REFERENCES entrance_exams(id),
    score INT,
    status VARCHAR(50)
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    dob DATE,
    class VARCHAR(20),
    section VARCHAR(10),
    admission_date DATE DEFAULT CURRENT_DATE,
    parent_name VARCHAR(150),
    parent_phone VARCHAR(20),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ATTENDANCE
-- =========================

CREATE TABLE lectures (
    id SERIAL PRIMARY KEY,
    class VARCHAR(20),
    section VARCHAR(10),
    subject VARCHAR(100),
    lecture_date DATE,
    start_time TIME,
    end_time TIME
);

CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    lecture_id INT REFERENCES lectures(id),
    status VARCHAR(20),
    marked_by INT REFERENCES users(id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE biometric_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(100)
);

-- =========================
-- FEES
-- =========================

CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    class VARCHAR(20),
    amount DECIMAL(10,2)
);

CREATE TABLE fee_payments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    amount_paid DECIMAL(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_mode VARCHAR(50)
);

-- =========================
-- PAYROLL
-- =========================

CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    basic DECIMAL(10,2),
    allowance DECIMAL(10,2),
    deduction DECIMAL(10,2),
    net_salary DECIMAL(10,2),
    paid_date DATE
);

-- =========================
-- OPTIMIZATIONS & SEQUENCES
-- =========================

CREATE SEQUENCE student_id_seq START 1;

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_first_name ON students(first_name);
CREATE INDEX idx_users_email ON users(email);

-- =========================
-- ACADEMIC GRADING
-- =========================

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE
);

CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id),
    teacher_id INT REFERENCES users(id),
    marks_obtained DECIMAL(5,2),
    total_marks DECIMAL(5,2) DEFAULT 100,
    exam_type VARCHAR(50), -- e.g., 'Midterm', 'Final', 'Assignment'
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- AUDIT LOGS
-- =========================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action TEXT,
    module VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TRANSPORTATION
-- =========================

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    vehicle_id INT, 
    monthly_cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_no VARCHAR(20) UNIQUE NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    total_capacity INT
);

CREATE TABLE transport_allotments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    route_id INT REFERENCES routes(id),
    vehicle_id INT REFERENCES vehicles(id),
    allotment_date DATE DEFAULT CURRENT_DATE
);

-- =========================
-- HOSTEL MANAGEMENT
-- =========================

CREATE TABLE hostels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20), -- 'BOYS', 'GIRLS'
    address TEXT
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    hostel_id INT REFERENCES hostels(id),
    room_no VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4,
    monthly_rent DECIMAL(10,2) NOT NULL
);

CREATE TABLE hostel_allotments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    room_id INT REFERENCES rooms(id),
    allotment_date DATE DEFAULT CURRENT_DATE
);

-- =========================
-- SERVICE REQUESTS
-- =========================

CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL, -- 'TRANSPORT' or 'HOSTEL'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    request_details JSONB, -- stores { route_id: 1 } or { hostel_id: 1, remarks: '...' }
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
