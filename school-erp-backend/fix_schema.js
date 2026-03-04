const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('Fixing students schema...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                school_id UUID NOT NULL,
                admission_no VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                national_id TEXT,
                full_name VARCHAR(255),
                date_of_birth DATE,
                gender VARCHAR(255),
                current_class_id UUID,
                parent_contact VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID,
                updated_by UUID
            )
        `);
        console.log('Indexes...');
        await pool.query('CREATE INDEX IF NOT EXISTS "IDX_students_school_id" ON students(school_id)');
        await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_students_school_admission" ON students(school_id, admission_no)');

        console.log('SUCCESS');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
