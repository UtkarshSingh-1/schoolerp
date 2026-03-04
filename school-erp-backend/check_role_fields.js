const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        const res = await pool.query(`SELECT * FROM roles LIMIT 0`);
        console.log('FIELDS:', res.fields.map(f => f.name).join('|'));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
