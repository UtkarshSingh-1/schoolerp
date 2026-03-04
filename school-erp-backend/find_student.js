require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function findStudent() {
    try {
        const res = await pool.query(`
            SELECT u.email, u.first_name, s.dob, s.student_id
            FROM users u 
            JOIN students s ON u.email = s.email 
            WHERE u.role_id = (SELECT id FROM roles WHERE name = 'STUDENT') 
            LIMIT 5
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Query Error:', err);
    } finally {
        await pool.end();
    }
}

findStudent();
