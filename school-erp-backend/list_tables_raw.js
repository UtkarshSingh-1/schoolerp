const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});
async function check() {
    try {
        const tables = ['schools', 'users', 'roles', 'classes'];
        for (const t of tables) {
            const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1", [t]);
            console.log(`--- Columns for ${t} ---`);
            console.table(res.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
