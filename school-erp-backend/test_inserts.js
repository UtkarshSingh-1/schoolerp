const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
    password: process.env.DB_PASS, port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

async function test(sql, params) {
    try {
        console.log(`Testing: ${sql.substring(0, 50)}...`);
        await pool.query(sql, params);
        console.log(' - OK');
    } catch (e) {
        console.error(' - FAIL:', e.message, 'at pos', e.position);
    }
}

async function run() {
    try {
        await pool.query('TRUNCATE schools, roles CASCADE');

        await test('INSERT INTO "schools" ("id", "name", "subdomain", "is_active") VALUES ($1, $2, $3, $4)',
            ['00000000-0000-0000-0000-000000000000', 'S', 's', true]);

        await test('INSERT INTO "roles" ("id", "school_id", "name") VALUES ($1, $2, $3)',
            ['00000000-0000-0000-0000-111111111111', '00000000-0000-0000-0000-000000000000', 'R']);

    } finally {
        await pool.end();
    }
}
run();
