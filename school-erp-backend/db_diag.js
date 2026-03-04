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

async function checkSchema() {
    try {
        console.log('Testing connection...');
        const time = await pool.query('SELECT NOW()');
        console.log('Connection successful:', time.rows[0].now);

        console.log('Checking for classes table...');
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'classes'
        `);

        if (tableCheck.rows.length === 0) {
            console.log('ERROR: classes table does not exist!');
        } else {
            console.log('SUCCESS: classes table exists.');
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'classes'
            `);
            console.log('Columns:', columns.rows);
        }

        console.log('Checking for entrance_exams table...');
        const examCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'entrance_exams'
        `);

        if (examCheck.rows.length === 0) {
            console.log('ERROR: entrance_exams table does not exist!');
        } else {
            console.log('SUCCESS: entrance_exams table exists.');
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'entrance_exams'
            `);
            console.log('Exam Columns:', columns.rows);
        }

        await pool.end();
    } catch (err) {
        console.error('Database diagnostic failed:', err);
    }
}

checkSchema();
