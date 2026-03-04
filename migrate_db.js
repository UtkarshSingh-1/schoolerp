const fs = require('fs');
const path = require('path');

// Use absolute paths for dependencies found in school-erp-backend
const backendNodeModules = path.resolve(__dirname, 'school-erp-backend', 'node_modules');
const pgPath = path.join(backendNodeModules, 'pg');
const dotenvPath = path.join(backendNodeModules, 'dotenv');

const { Client } = require(pgPath);
require(dotenvPath).config({ path: path.resolve(__dirname, 'school-erp-v3', '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('ERROR: DATABASE_URL not found in .env');
    process.exit(1);
}

console.log('Targeting DB Host:', connectionString.split('@')[1] ? connectionString.split('@')[1].split('/')[0] : 'Unknown');

const sqlFiles = [
    '05-database-schema.md',
    'school-erp-v3/migrations/schema_v3_tenant_indices.sql',
    'school-erp-v3/migrations/schema_v4_finance_hardening.sql',
    'school-erp-v3/update_schema_phase_3.sql',
    'school-erp-v3/update_schema_phase_4.sql',
    'seed.sql',
    '01_seed_academics.sql'
];

async function migrate() {
    console.log('Starting migration...');
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        for (const file of sqlFiles) {
            console.log(`\n--- Executing: ${file} ---`);
            const filePath = path.resolve(__dirname, file);
            if (!fs.existsSync(filePath)) {
                console.warn(`File not found: ${filePath}`);
                continue;
            }
            let sql = fs.readFileSync(filePath, 'utf8');

            if (file.endsWith('.md')) {
                sql = sql.replace(/```sql/g, '').replace(/```/g, '');
            }

            try {
                await client.query(sql);
                console.log(`Success: ${file}`);
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log(`Notice: Objects in ${file} already exist, skipping...`);
                } else {
                    console.error(`Error in ${file}:`, err.message);
                    // Decide if we should continue. For schema creation, maybe continue if it's a minor error.
                    // But for now, let's stop on real errors to avoid inconsistent state.
                    throw err;
                }
            }
        }

        console.log('\nMigration completed successfully!');
    } catch (err) {
        console.error('\n!!! Migration failed FATAL !!!');
        console.error(err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } finally {
        await client.end();
        console.log('Disconnected.');
    }
}

migrate();
