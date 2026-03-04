const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- NEON FINAL SEED V2 START ---');

        const schoolId = '66666666-6666-6666-6666-666666666666';
        const systemSchoolId = '00000000-0000-0000-0000-000000000000';
        const adminUserId = '00000000-0000-0000-0000-000000000001';
        const teacherUserId = '00000000-0000-0000-0000-000000000010';
        const teacherId = '00000000-0000-0000-0000-000000000011';
        const studentId = '00000000-0000-0000-0000-000000000020';

        const tables = ['schools', 'users', 'roles', 'teachers', 'subjects', 'classes', 'students', 'lecture_schedules', 'transactions', 'ledger_entries', 'exam_attempts'];
        console.log('Truncating...');
        await pool.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE`);

        console.log('Inserting Schools...');
        await pool.query(`INSERT INTO schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [systemSchoolId, 'System', 'system', true]);
        await pool.query(`INSERT INTO schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [schoolId, 'Demo School', 'demo', true]);

        const superAdminId = '00000000-0000-0000-0000-111111111111';
        const teacherRoleId = '00000000-0000-0000-0000-333333333333';

        console.log('Inserting Roles...');
        await pool.query(`INSERT INTO roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4)`, [superAdminId, systemSchoolId, 'SUPER_ADMIN', JSON.stringify(['*'])]);
        await pool.query(`INSERT INTO roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4)`, [teacherRoleId, schoolId, 'TEACHER', JSON.stringify(['read'])]);

        const passwordHash = '$2b$10$Y.x1gtwIvPmuwXTrl364S.T68fVpuF8XP/DtvOofLTEzUodNp8G2u';

        console.log('Inserting Users...');
        await pool.query(`INSERT INTO users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminUserId, systemSchoolId, 'superadmin@system.com', passwordHash, 'System Admin', superAdminId, true]);
        await pool.query(`INSERT INTO users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [teacherUserId, schoolId, 'teacher@demo.com', passwordHash, 'John Doe', teacherRoleId, true]);

        console.log('Inserting Profiles...');
        await pool.query(`INSERT INTO teachers (id, school_id, user_id, employee_id, full_name, specialization) VALUES ($1, $2, $3, $4, $5, $6)`, [teacherId, schoolId, teacherUserId, 'EMP-001', 'John Doe', 'Mathematics']);
        await pool.query(`INSERT INTO subjects (id, school_id, name, code) VALUES ($1, $2, $3, $4)`, [crypto.randomUUID(), schoolId, 'Mathematics', 'MATH101']);
        await pool.query(`INSERT INTO classes (id, school_id, name, section) VALUES ($1, $2, $3, $4)`, [crypto.randomUUID(), schoolId, '10-A', 'A']);
        // Note: admission_no matches entity
        await pool.query(`INSERT INTO students (id, school_id, admission_no, first_name, last_name, parent_contact, gender) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [studentId, schoolId, 'ADM-2024-001', 'Demo', 'Student', '+919876543210', 'M']);

        console.log('--- NEON FINAL SEED V2 SUCCESS ---');
    } catch (e) {
        console.error('--- NEON FINAL SEED V2 FAIL ---');
        console.error(e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}
run();
