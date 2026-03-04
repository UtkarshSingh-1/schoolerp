const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('Listing tables BEFORE truncate...');
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name).join('|'));

        console.log('Truncating ALL...');
        const tables = ['schools', 'users', 'roles', 'teachers', 'subjects', 'classes', 'students', 'lecture_schedules', 'transactions', 'ledger_entries', 'exam_attempts'];
        await pool.query(`TRUNCATE TABLE ${tables.join(', ')} CASCADE`);
        console.log('Success');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
