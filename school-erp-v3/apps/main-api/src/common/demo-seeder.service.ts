import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DemoSeederService {
    private readonly logger = new Logger(DemoSeederService.name);

    constructor(private dataSource: DataSource) { }

    async seed() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query('SET search_path TO public');
        await queryRunner.startTransaction();

        try {
            console.error('[Seeder] Starting Pure SQL Seeding (Parameterised)...');

            const schoolId = '66666666-6666-6666-6666-666666666666';
            const systemSchoolId = '00000000-0000-0000-0000-000000000000';
            const adminUserId = '00000000-0000-0000-0000-000000000001';
            const teacherUserId = '00000000-0000-0000-0000-000000000010';
            const teacherId = '00000000-0000-0000-0000-000000000011';
            const studentId = '00000000-0000-0000-0000-000000000020';
            const subjectId = '00000000-0000-0000-0000-000000000030';
            const classId = '00000000-0000-0000-0000-000000000040';

            const superAdminRoleId = '00000000-0000-0000-0000-111111111111';
            const adminRoleId = '00000000-0000-0000-0000-222222222222';
            const teacherRoleId = '00000000-0000-0000-0000-333333333333';

            await queryRunner.query(`TRUNCATE TABLE schools, users, roles, teachers, subjects, classes, students, lecture_schedules, transactions, ledger_entries, exam_attempts CASCADE`);

            // Schools
            await queryRunner.query(`INSERT INTO schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [systemSchoolId, 'System', 'system', true]);
            await queryRunner.query(`INSERT INTO schools (id, name, subdomain, is_active) VALUES ($1, $2, $3, $4)`, [schoolId, 'Demo School', 'demo', true]);

            // Roles
            await queryRunner.query(`INSERT INTO roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4::jsonb)`, [superAdminRoleId, systemSchoolId, 'SUPER_ADMIN', JSON.stringify(['*'])]);
            await queryRunner.query(`INSERT INTO roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4::jsonb)`, [adminRoleId, systemSchoolId, 'ADMIN', JSON.stringify(['school.manage_users', 'school.manage_settings', 'system.read_audit', 'dashboard.read'])]);
            await queryRunner.query(`INSERT INTO roles (id, school_id, name, permissions) VALUES ($1, $2, $3, $4::jsonb)`, [teacherRoleId, schoolId, 'TEACHER', JSON.stringify(['attendance.mark', 'schedule.read', 'dashboard.read'])]);

            const passwordHash = await bcrypt.hash('Admin@123', 10);

            // Users
            await queryRunner.query(`INSERT INTO users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [adminUserId, systemSchoolId, 'superadmin@system.com', passwordHash, 'System Admin', superAdminRoleId, true]);
            await queryRunner.query(`INSERT INTO users (id, school_id, email, password_hash, full_name, role_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [teacherUserId, schoolId, 'teacher@demo.com', passwordHash, 'John Doe', teacherRoleId, true]);

            // Profile
            await queryRunner.query(`INSERT INTO teachers (id, school_id, user_id, employee_id, full_name, specialization) VALUES ($1, $2, $3, $4, $5, $6)`, [teacherId, schoolId, teacherUserId, 'EMP-001', 'John Doe', 'Mathematics']);
            await queryRunner.query(`INSERT INTO subjects (id, school_id, name, code) VALUES ($1, $2, $3, $4)`, [subjectId, schoolId, 'Mathematics', 'MATH101']);
            await queryRunner.query(`INSERT INTO classes (id, school_id, name, section) VALUES ($1, $2, $3, $4)`, [classId, schoolId, '10-A', 'A']);
            await queryRunner.query(`INSERT INTO students (id, school_id, admission_number, first_name, last_name, class_id, parent_contact, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [studentId, schoolId, 'ADM-2024-001', 'Demo', 'Student', classId, '+919876543210', 'M']);
            await queryRunner.query(`INSERT INTO lecture_schedules (id, school_id, teacher_id, class_id, subject_id, day_of_week, start_time, end_time, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [uuidv4(), schoolId, teacherId, classId, subjectId, 'MONDAY', '08:00:00', '09:00:00', '101']);

            // Finance
            const txId = uuidv4();
            await queryRunner.query(`INSERT INTO transactions (id, school_id, student_id, amount, currency, status, type, payment_method, idempotency_key, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [txId, schoolId, studentId, 50000, 'INR', 'COMPLETED', 'GENERAL', 'CASH', uuidv4(), adminUserId]);
            await queryRunner.query(`INSERT INTO ledger_entries (id, school_id, transaction_id, debit_account, credit_account, amount, currency) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [uuidv4(), schoolId, txId, 'CASH_HAND', 'TUITION_FEES', 50000, 'INR']);

            // Exams
            await queryRunner.query(`INSERT INTO exam_attempts (id, school_id, student_id, exam_id, status, risk_score, violation_count, auto_submit_reason, ip_address, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`, [uuidv4(), schoolId, studentId, uuidv4(), 'AUTO_SUBMITTED', 85, 4, 'Critical Violation Threshold Reached', '192.168.1.50']);

            await queryRunner.commitTransaction();
            console.error('[Seeder] SUCCESS');
        } catch (err: any) {
            await queryRunner.rollbackTransaction();
            console.error('[Seeder] FAIL:', err.message);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
