const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('Testing insert into students...');
        const studentId = '00000000-0000-0000-0000-000000000020';
        const schoolId = '66666666-6666-6666-6666-666666666666';

        await pool.query(`INSERT INTO students (id, school_id, admission_number, first_name, last_name, parent_contact, gender) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [studentId, schoolId, 'ADM-2024-001', 'D', 'S', 'P', 'M']);
        console.log('Success');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
