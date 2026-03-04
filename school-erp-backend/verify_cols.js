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
            SELECT DISTINCT typname 
            FROM pg_type 
            JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid;
        `);
        console.log('Postgres Enums found:');
        res.rows.forEach(r => console.log(` - ${r.typname}`));
    } finally {
        await pool.end();
    }
}
run();
