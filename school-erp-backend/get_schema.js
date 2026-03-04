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

async function get_schema() {
    const tables = ['classes', 'entrance_exams', 'subjects', 'applicants', 'exam_results'];
    const schema = {};

    try {
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            schema[table] = res.rows;
        }
        fs.writeFileSync('schema.json', JSON.stringify(schema, null, 2), { encoding: 'utf8' });
        console.log('Schema written to schema.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

get_schema();
