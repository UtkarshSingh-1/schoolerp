require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'classes'
            ORDER BY ordinal_position
        `);
        console.log('Columns for table classes:');
        console.table(columns.rows);
        await pool.end();
    } catch (err) {
        console.error('Failed to get columns:', err);
    }
}

checkColumns();
