const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- NEON SEEDER START (UNIFIED) ---');

        const schoolId = '66666666-6666-6666-6666-666666666666';
        const systemSchoolId = '00000000-0000-0000-0000-000000000000';
        const adminUserId = '00000000-0000-0000-0000-000000000001';
        const teacherUserId = '00000000-0000-0000-0000-000000000010';
        const teacherId = '00000000-0000-0000-0000-000000000011';
        const studentId = '00000000-0000-0000-0000-000000000020';
        const subjectId = '00000000-0000-0000-0000-000000000030';
        const classId = '00000000-0000-0000-0000-000000000040';

        const superAdminRoleId = '00000000-0000-0000-0000-111111111111';
        const teacherRoleId = '00000000-0000-0000-0000-333333333333';

        await client.query('BEGIN');
        await client.query('SET search_path TO public');

        console.log('Truncating...');
        await client.query(`TRUNCATE TABLE public.schools, public.users, public.roles, public.teachers, public.subjects, public.classes, public.students, public.lecture_schedules, public.transactions, public.ledger_entries, public.exam_attempts CASCADE`);

        console.log('Inserting Schools...');
        await client.query(`INSERT INTO public.schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [systemSchoolId, 'System', 'system', true]);
        await client.query(`INSERT INTO public.schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [schoolId, 'Demo School', 'demo', true]);

        console.log('Inserting Roles...');
        await client.query(`INSERT INTO public.roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4)`, [superAdminRoleId, systemSchoolId, 'SUPER_ADMIN', JSON.stringify(['system.manage_tenants', 'system.read_audit', 'dashboard.read'])]);
        await client.query(`INSERT INTO public.roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4)`, [teacherRoleId, schoolId, 'TEACHER', JSON.stringify(['attendance.mark', 'schedule.read', 'dashboard.read'])]);

        const passwordHash = '$2b$10$SVPi2TH5SuyJSNyJ/xoXZO9ejL2xNpYDDcoPUcuS8cfY/PFIpqYGW';

        console.log('Inserting Users...');
        await client.query(`INSERT INTO public.users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminUserId, systemSchoolId, 'superadmin@system.com', passwordHash, 'System Admin', superAdminRoleId, true]);
        await client.query(`INSERT INTO public.users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [teacherUserId, schoolId, 'teacher@demo.com', passwordHash, 'John Doe', teacherRoleId, true]);

        console.log('Inserting Profile...');
        await client.query(`INSERT INTO public.teachers (id, school_id, user_id, employee_id, full_name, specialization) VALUES ($1, $2, $3, $4, $5, $6)`, [teacherId, schoolId, teacherUserId, 'EMP-001', 'John Doe', 'Mathematics']);
        await client.query(`INSERT INTO public.subjects (id, school_id, name, code) VALUES ($1, $2, $3, $4)`, [subjectId, schoolId, 'Mathematics', 'MATH101']);
        await client.query(`INSERT INTO public.classes (id, school_id, name, section) VALUES ($1, $2, $3, $4)`, [classId, schoolId, '10-A', 'A']);
        await client.query(`INSERT INTO public.students (id, school_id, admission_number, first_name, last_name, class_id, parent_contact, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [studentId, schoolId, 'ADM-2024-001', 'Demo', 'Student', classId, '+919876543210', 'M']);
        await client.query(`INSERT INTO public.lecture_schedules (id, school_id, teacher_id, class_id, subject_id, day_of_week, start_time, end_time, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [crypto.randomUUID(), schoolId, teacherId, classId, subjectId, 'MONDAY', '08:00:00', '09:00:00', '101']);

        console.log('Inserting Finance...');
        const txId = crypto.randomUUID();
        await client.query(`INSERT INTO public.transactions (id, school_id, student_id, amount, currency, status, type, payment_method, idempotency_key, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [txId, schoolId, studentId, 50000, 'INR', 'COMPLETED', 'GENERAL', 'CASH', crypto.randomUUID(), adminUserId]);
        await client.query(`INSERT INTO public.ledger_entries (id, school_id, transaction_id, debit_account, credit_account, amount, currency) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [crypto.randomUUID(), schoolId, txId, 'CASH_HAND', 'TUITION_FEES', 50000, 'INR']);

        console.log('Inserting Exams...');
        await client.query(`INSERT INTO public.exam_attempts (id, school_id, student_id, exam_id, status, risk_score, violation_count, auto_submit_reason, ip_address, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`, [crypto.randomUUID(), schoolId, studentId, crypto.randomUUID(), 'AUTO_SUBMITTED', 85, 4, 'Critical Violation Threshold Reached', '192.168.1.50']);

        await client.query('COMMIT');
        console.log('--- NEON SEEDER SUCCESS ---');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('--- NEON SEEDER FAIL ---');
        console.error(e.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}
run();
