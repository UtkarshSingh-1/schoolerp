const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        const tables = ['users', 'teachers', 'schools', 'roles'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY column_name;
            `);
            console.log(`COLS_${table}: ${res.rows.map(r => r.column_name).join('|')}`);
        }
    } finally {
        await pool.end();
    }
}
run();
