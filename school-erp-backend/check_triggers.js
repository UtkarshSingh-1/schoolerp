const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        const res = await pool.query(`
            SELECT tgname, relname 
            FROM pg_trigger 
            JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
            WHERE relname IN ('users', 'teachers');
        `);
        console.log('Triggers:', res.rows);
    } finally {
        await pool.end();
    }
}
run();
