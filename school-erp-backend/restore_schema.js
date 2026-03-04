const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- MANUAL SCHEMA RESTORATION ---');

        await pool.query(`CREATE TABLE IF NOT EXISTS subjects (
            id UUID PRIMARY KEY,
            school_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS classes (
            id UUID PRIMARY KEY,
            school_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            section VARCHAR(255) NOT NULL,
            maximum_capacity INT DEFAULT 40,
            current_enrollment INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS teachers (
            id UUID PRIMARY KEY,
            school_id UUID NOT NULL,
            user_id UUID NOT NULL,
            employee_id VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            specialization VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS students (
            id UUID PRIMARY KEY,
            school_id UUID NOT NULL,
            admission_no VARCHAR(255) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            national_id TEXT,
            full_name VARCHAR(255),
            date_of_birth DATE,
            gender VARCHAR(50),
            current_class_id UUID,
            parent_contact VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            created_by UUID,
            updated_by UUID
        )`);

        console.log('SUCCESS: Tables created.');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
