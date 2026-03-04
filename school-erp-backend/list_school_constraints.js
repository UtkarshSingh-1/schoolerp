const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Constraints for schools ---');
        const res1 = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'schools'::regclass");
        console.log(JSON.stringify(res1.rows, null, 2));

        console.log('--- Indexes for schools ---');
        const res2 = await pool.query("SELECT i.relname AS index_name, pg_get_indexdef(i.oid) AS index_def FROM pg_index x JOIN pg_class c ON c.oid = x.indrelid JOIN pg_class i ON i.oid = x.indexrelid WHERE c.relname = 'schools'");
        console.log(JSON.stringify(res2.rows, null, 2));

    } finally {
        await pool.end();
    }
}
run();
