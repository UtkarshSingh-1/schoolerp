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

async function testInsert() {
    try {
        console.log('Attempting to insert a test class...');
        const result = await pool.query(
            'INSERT INTO classes (name, section, maximum_capacity) VALUES ($1, $2, $3) RETURNING *',
            ['Test Class', 'T', 10]
        );
        console.log('Insert SUCCESS:', result.rows[0]);

        // Clean up
        await pool.query('DELETE FROM classes WHERE id = $1', [result.rows[0].id]);
        console.log('Cleanup SUCCESS.');

        await pool.end();
    } catch (err) {
        console.error('Insert FAILED:', err);
    }
}

testInsert();
