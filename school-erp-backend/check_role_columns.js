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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'roles'
            ORDER BY column_name;
        `);
        console.log('Columns for table "roles":');
        res.rows.forEach(row => {
            console.log(` - ${row.column_name} (${row.data_type})`);
        });
    } finally {
        await pool.end();
    }
}
run();
