const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const data = {};
    try {
        const tables = ['schools', 'users', 'roles'];
        for (const t of tables) {
            const res = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = $1", [t]);
            data[t] = res.rows;
        }
        fs.writeFileSync('schema_dump.json', JSON.stringify(data, null, 2));
        console.log('Schema dumped to schema_dump.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
