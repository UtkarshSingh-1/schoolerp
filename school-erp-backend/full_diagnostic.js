// COMPREHENSIVE DIAGNOSTIC: Tests every API endpoint the frontend uses
// and checks the database for all required tables and data
require('dotenv').config({ path: '../school-erp-v3/.env' });
const http = require('http');
const { Client } = require('pg');
const fs = require('fs');

const results = { db: {}, api: {} };

// ---- STEP 1: Database Audit ----
async function auditDatabase() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
    });
    await client.connect();

    // Check all tables
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;");
    results.db.tables = tables.rows.map(r => r.table_name);

    // Count students
    const students = await client.query("SELECT id, admission_no, full_name, current_class_id, school_id FROM students ORDER BY created_at DESC LIMIT 10;");
    results.db.students = students.rows;

    // Count classes
    const classes = await client.query("SELECT id, name, section, school_id FROM classes LIMIT 10;");
    results.db.classes = classes.rows;

    // Count admissions
    const admissions = await client.query("SELECT * FROM admissions LIMIT 10;");
    results.db.admissions = admissions.rows;

    // Check roles & permissions
    const roles = await client.query("SELECT id, name, permissions FROM roles LIMIT 10;");
    results.db.roles = roles.rows;

    // Check users
    const users = await client.query("SELECT id, email, role_id, school_id FROM users LIMIT 5;");
    results.db.users = users.rows;

    // Check audit_logs schema
    try {
        const auditCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='audit_logs' ORDER BY ordinal_position;");
        results.db.audit_logs_columns = auditCols.rows;
    } catch (e) { results.db.audit_logs_columns = 'TABLE MISSING: ' + e.message; }

    // Check students schema
    const studentCols = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='students' ORDER BY ordinal_position;");
    results.db.students_columns = studentCols.rows;

    await client.end();
}

// ---- STEP 2: API Audit ----
function apiCall(method, path, token) {
    return new Promise((resolve) => {
        const headers = { 'Content-Type': 'application/json', 'x-school-id': '66666666-6666-6666-6666-666666666666' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const req = http.request({ hostname: 'localhost', port: 3001, path: '/api/v3' + path, method, headers }, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', e => resolve({ status: 'ERROR', body: e.message }));
        if (method === 'POST') req.write(JSON.stringify({ email: 'superadmin@demo.com', password: 'Admin@123' }));
        req.end();
    });
}

async function auditAPIs() {
    // Login first
    const login = await apiCall('POST', '/auth/login');
    results.api.login = { status: login.status };
    if (login.status !== 200 && login.status !== 201) {
        results.api.login.error = login.body;
        return;
    }
    const token = login.body.token;

    // Test every endpoint the frontend calls
    const endpoints = [
        ['GET', '/students'],
        ['GET', '/classes'],
        ['GET', '/dashboard/metrics'],
        ['GET', '/dashboard/recent-admissions'],
        ['GET', '/admissions'],
        ['GET', '/teachers'],
        ['GET', '/subjects'],
        ['GET', '/attendance'],
        ['GET', '/exams'],
        ['GET', '/timetable'],
        ['GET', '/finance/fees/transactions'],
    ];

    for (const [method, path] of endpoints) {
        const res = await apiCall(method, path, token);
        results.api[path] = {
            status: res.status,
            isArray: Array.isArray(res.body),
            length: Array.isArray(res.body) ? res.body.length : undefined,
            error: res.status >= 400 ? res.body : undefined
        };
    }
}

async function main() {
    console.log('=== FULL STACK DIAGNOSTIC ===');
    console.log('Running database audit...');
    await auditDatabase();
    console.log('Running API audit...');
    await auditAPIs();
    fs.writeFileSync('diagnostic_results.json', JSON.stringify(results, null, 2));
    console.log('Done! Results saved to diagnostic_results.json');
}

main().catch(e => {
    console.error('DIAGNOSTIC FAILED:', e);
    fs.writeFileSync('diagnostic_results.json', JSON.stringify({ error: e.message }, null, 2));
});
