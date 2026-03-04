const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function run() {
    try {
        await pool.query('TRUNCATE schools, roles, users CASCADE');

        console.log('Testing Schools...');
        await pool.query(`INSERT INTO "schools" ("id", "name", "subdomain", "is_active") VALUES ($1, $2, $3, $4)`,
            ['00000000-0000-0000-0000-000000000000', 'S', 's', true]);

        console.log('Testing Roles...');
        await pool.query(`INSERT INTO "roles" ("id", "school_id", "name", "permissions") VALUES ($1, $2, $3, $4)`,
            ['00000000-0000-0000-0000-111111111111', '00000000-0000-0000-0000-000000000000', 'R', '[]']);

        console.log('Testing Users...');
        await pool.query(`INSERT INTO "users" ("id", "school_id", "email", "password_hash", "full_name", "role_id", "is_active") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['00000000-0000-0000-0000-222222222222', '00000000-0000-0000-0000-000000000000', 'u@u.com', 'h', 'N', '00000000-0000-0000-0000-111111111111', true]);

        console.log('All OK');
    } catch (e) {
        console.error('FAIL:', e.message, 'at pos', e.position);
    } finally {
        await pool.end();
    }
}
run();
