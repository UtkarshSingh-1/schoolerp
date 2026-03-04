const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('Testing truncate of students...');
        await pool.query("TRUNCATE TABLE students CASCADE");
        console.log('Success');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
