const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- FINAL DATA VERIFICATION ---');

        const schools = await pool.query('SELECT count(*) FROM schools');
        console.log('Schools:', schools.rows[0].count);

        const roles = await pool.query('SELECT count(*) FROM roles');
        console.log('Roles:', roles.rows[0].count);

        const users = await pool.query('SELECT email, full_name FROM users');
        console.log('Users:', users.rows.map(u => `${u.email} (${u.full_name})`).join(', '));

        const students = await pool.query('SELECT count(*) FROM students');
        console.log('Students:', students.rows[0].count);

        console.log('--- VERIFICATION SUCCESS ---');
    } catch (e) {
        console.error('--- VERIFICATION FAIL ---');
        console.error(e.message);
    } finally {
        await pool.end();
    }
}
run();
