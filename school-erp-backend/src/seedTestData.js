const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function seedTestData() {
    const client = await pool.connect();
    try {
        console.log('Seeding Test Applicants and Results...');
        await client.query('BEGIN');

        // 1. Get an exam ID
        const examRes = await client.query("SELECT id FROM entrance_exams WHERE title = 'Class XI Entrance 2026' LIMIT 1");
        if (examRes.rows.length === 0) throw new Error('Exam not found. Run seedAcademics.js first.');
        const examId = examRes.rows[0].id;

        // 2. Create Applicants
        const applicants = [
            ['John', 'Doe', '2010-05-15', '1234567890', 'john@test.com', 'Class XI'],
            ['Jane', 'Smith', '2010-08-20', '0987654321', 'jane@test.com', 'Class XI'],
            ['Alice', 'Johnson', '2010-02-10', '1112223333', 'alice@test.com', 'Class XI'],
            ['Bob', 'Brown', '2010-11-05', '4445556666', 'bob@test.com', 'Class XI']
        ];

        for (const app of applicants) {
            const appRes = await client.query(
                'INSERT INTO applicants (first_name, last_name, dob, phone, email, applied_class) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                app
            );
            const applicantId = appRes.rows[0].id;

            // 3. Create Exam Results (Random scores)
            const scores = [85, 92, 78, 88];
            const score = scores[applicants.indexOf(app)];

            await client.query(
                'INSERT INTO exam_results (applicant_id, exam_id, score, status) VALUES ($1, $2, $3, $4)',
                [applicantId, examId, score, 'PENDING']
            );
        }

        await client.query('COMMIT');
        console.log('Test data seeded successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seeding error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedTestData();
