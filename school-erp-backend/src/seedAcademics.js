const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function seedAcademics() {
    const client = await pool.connect();
    try {
        console.log('Seeding Academic data...');
        await client.query('BEGIN');

        // 0. Ensure classes table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                section VARCHAR(10) NOT NULL,
                maximum_capacity INT DEFAULT 30,
                UNIQUE(name, section)
            )
        `);

        // 1. Seed Classes
        console.log('Seeding Classes...');
        await client.query(`
            INSERT INTO classes (name, section, maximum_capacity) VALUES 
            ('Class I', 'A', 30),
            ('Class I', 'B', 30),
            ('Class II', 'A', 35),
            ('Class IX', 'A', 40),
            ('Class IX', 'B', 40),
            ('Class X', 'A', 40),
            ('Class XI', 'A-Sci', 35),
            ('Class XI', 'B-Com', 35),
            ('Class XII', 'A-Sci', 35),
            ('Class XII', 'B-Com', 35)
            ON CONFLICT (name, section) DO NOTHING
        `);

        // 2. Seed Subjects
        console.log('Seeding Subjects...');
        await client.query(`
            INSERT INTO subjects (name, code) VALUES 
            ('Mathematics', 'MATH-01'),
            ('Science', 'SCI-01'),
            ('English Literature', 'ENG-01'),
            ('History', 'HIST-01'),
            ('Computer Science', 'CS-01'),
            ('Physics', 'PHYS-01'),
            ('Chemistry', 'CHEM-01'),
            ('Accountancy', 'ACC-01'),
            ('Economics', 'ECO-01')
            ON CONFLICT (name) DO NOTHING
        `);

        // 3. Seed Entrance Exams
        console.log('Seeding Entrance Exams...');
        await client.query(`
            INSERT INTO entrance_exams (title, exam_date, total_marks) VALUES 
            ('Class XI Entrance 2026', '2026-03-15', 100),
            ('Class IX Entrance 2026', '2026-03-20', 100)
            ON CONFLICT DO NOTHING
        `);

        await client.query('COMMIT');
        console.log('Academic data seeded successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seeding error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedAcademics();
