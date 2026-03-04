const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        const tables = ['schools', 'users', 'roles', 'teachers', 'subjects', 'classes', 'students'];
        console.log('--- TABLE AUDIT ---');
        for (const table of tables) {
            try {
                const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`${table.padEnd(12)}: ${res.rows[0].count}`);
            } catch (e) {
                console.log(`${table.padEnd(12)}: MISSING (${e.message})`);
            }
        }
    } finally {
        await pool.end();
    }
}
run();
