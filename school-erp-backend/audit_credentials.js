const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- CREDENTIALS AUDIT ---');
        const res = await pool.query(`
            SELECT u.email, u.full_name, u.is_active, r.name as role_name, s.name as school_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN schools s ON u.school_id = s.id
        `);
        res.rows.forEach(r => {
            console.log(`User: ${r.email}, Name: ${r.full_name}, Role: ${r.role_name}, School: ${r.school_name}, Active: ${r.is_active}`);
        });
        console.log('--- AUDIT COMPLETE ---');
    } catch (e) {
        console.error('FAIL:', e.message);
    } finally {
        await pool.end();
    }
}
run();
