const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './school-erp-v3/.env' });

const connectionString = process.env.DATABASE_URL;

async function check() {
    console.log('Testing connection to:', connectionString ? connectionString.split('@')[1] : 'MISSING URL');
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Successfully connected to PG!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('DB Info:', res.rows[0]);
    } catch (err) {
        console.error('PG CONNECTION ERROR:', err.message);
        if (err.detail) console.error('DETAIL:', err.detail);
        if (err.hint) console.error('HINT:', err.hint);
    } finally {
        await client.end();
    }
}

check();
