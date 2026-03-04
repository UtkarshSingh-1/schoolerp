const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Search in pg_class ---');
        const res1 = await pool.query("SELECT relname FROM pg_class WHERE relname = 'UQ_26601c4c1533036e4f392f7c8be'");
        console.log(res1.rows);

        console.log('--- Search in pg_constraint ---');
        const res2 = await pool.query("SELECT conname, contype, conrelid::regclass FROM pg_constraint WHERE conname = 'UQ_26601c4c1533036e4f392f7c8be'");
        console.log(res2.rows);

        console.log('--- Search in information_schema.table_constraints ---');
        const res3 = await pool.query("SELECT table_name, constraint_name FROM information_schema.table_constraints WHERE constraint_name = 'UQ_26601c4c1533036e4f392f7c8be'");
        console.log(res3.rows);

    } finally {
        await pool.end();
    }
}
run();
