const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    // Neon requires endpoint hostname (SNI), not the raw IP.
    host: process.env.DB_HOSTNAME || process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
