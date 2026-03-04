const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        console.log('--- SYSTEM WIDE AUDIT ---');

        console.log('\nSchools:');
        const schools = await pool.query('SELECT id, name, subdomain FROM schools');
        console.table(schools.rows);

        console.log('\nUsers:');
        const users = await pool.query('SELECT u.email, u.school_id, s.name as school_name, u.is_active FROM users u JOIN schools s ON u.school_id = s.id');
        console.table(users.rows);

        console.log('\nRoles:');
        const roles = await pool.query('SELECT id, school_id, name FROM roles');
        console.table(roles.rows);

        console.log('--- END AUDIT ---');
    } finally {
        await pool.end();
    }
}
run();
