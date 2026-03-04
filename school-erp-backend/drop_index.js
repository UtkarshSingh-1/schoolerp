require('dotenv').config({ path: '../school-erp-v3/.env' });
const { Client } = require('pg');
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

client.connect().then(() => {
    return client.query('DROP INDEX IF EXISTS "IDX_eaa0743b53cc5748714dd2e5ca" CASCADE;');
}).then(() => {
    console.log('Successfully dropped conflicting index.');
    client.end();
}).catch(err => {
    console.error('DB ERROR:', err.message);
    client.end();
});
