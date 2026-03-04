require('dotenv').config({ path: '../school-erp-v3/.env' });
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

client.connect().then(() => {
    return client.query("SELECT email, role_id, school_id FROM users WHERE email='superadmin@demo.com'");
}).then(res => {
    const data = {
        userExists: res.rows.length > 0,
        user: res.rows[0]
    };
    fs.writeFileSync('db_status.json', JSON.stringify(data));
    return client.query("SELECT * FROM roles WHERE id=$1", [res.rows[0]?.role_id]);
}).then(res => {
    const data = JSON.parse(fs.readFileSync('db_status.json'));
    data.roleExists = res.rows.length > 0;
    fs.writeFileSync('db_status.json', JSON.stringify(data));
    client.end();
}).catch(err => {
    fs.writeFileSync('db_status.json', JSON.stringify({ error: err.message }));
    client.end();
});
