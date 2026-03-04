const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        const res = await pool.query("SELECT current_schema()");
        console.log('Current Schema:', res.rows[0].current_schema);

        const path = await pool.query("SHOW search_path");
        console.log('Search Path:', path.rows[0].search_path);
    } finally {
        await pool.end();
    }
}
run();
