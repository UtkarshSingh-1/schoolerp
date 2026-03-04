// Provision Utkarsh Singh from admissions into students table
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

client.connect().then(async () => {
    // 1. Recreate audit_logs table
    await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id uuid NOT NULL,
      user_id uuid NOT NULL,
      action varchar NOT NULL DEFAULT 'CREATE',
      entity_name varchar NOT NULL DEFAULT 'SYSTEM',
      entity_id uuid,
      new_values jsonb,
      ip_address varchar,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('✓ audit_logs table ensured');

    // 2. Find Utkarsh Singh in admissions
    const admResult = await client.query("SELECT * FROM admissions WHERE status='APPROVED'");
    console.log(`Found ${admResult.rows.length} approved admissions`);

    for (const adm of admResult.rows) {
        // Check if already provisioned
        const existing = await client.query(
            "SELECT id FROM students WHERE full_name = $1 AND school_id = $2",
            [adm.applicantFullName, adm.schoolId]
        );
        if (existing.rows.length > 0) {
            console.log(`✓ Student "${adm.applicantFullName}" already exists, skipping`);
            continue;
        }

        // Split name
        const parts = adm.applicantFullName.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || 'N/A';

        await client.query(
            `INSERT INTO students (school_id, admission_no, first_name, last_name, full_name, parent_contact, current_class_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                adm.schoolId,
                `ADM-${Date.now()}`,
                firstName,
                lastName,
                adm.applicantFullName,
                adm.phone || '0000000000',
                adm.targetClassId
            ]
        );
        console.log(`✓ Provisioned student: ${adm.applicantFullName}`);
    }

    // 3. Clean up duplicate "Test Provision" and "Test Fifth" etc students
    const testStudents = await client.query(
        "SELECT id, full_name, first_name, admission_no FROM students WHERE full_name LIKE 'Test%' OR first_name LIKE 'Test%'"
    );
    console.log(`Found ${testStudents.rows.length} test students to clean up`);
    for (const s of testStudents.rows) {
        await client.query("DELETE FROM students WHERE id = $1", [s.id]);
        console.log(`✗ Removed test student: ${s.full_name || s.first_name} (${s.admission_no})`);
    }

    // 4. Show final state
    const finalStudents = await client.query("SELECT admission_no, full_name, first_name, last_name FROM students ORDER BY created_at DESC");
    console.log('\nFinal students in database:');
    finalStudents.rows.forEach(s => console.log(`  - ${s.admission_no}: ${s.full_name || (s.first_name + ' ' + s.last_name)}`));

    client.end();
}).catch(e => {
    console.error('ERROR:', e.message);
    client.end();
});
