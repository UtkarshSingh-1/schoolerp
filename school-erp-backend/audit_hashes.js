const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- HASH AUDIT ---');
        const res = await pool.query(`SELECT email, password_hash FROM users`);
        res.rows.forEach(r => {
            console.log(`Email: ${r.email}`);
            console.log(`Hash : ${r.password_hash}`);
            console.log(`Len  : ${r.password_hash.length}`);
        });
    } finally {
        await pool.end();
    }
}
run();
