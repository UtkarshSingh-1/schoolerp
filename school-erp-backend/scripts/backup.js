const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * School ERP Automated Backup Script
 * Uses pg_dump to create a database snapshot.
 */

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('DATABASE_URL not found in environment.');
    process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

console.log(`Starting backup to ${backupFile}...`);

// Simple pg_dump command (assumes pg_dump is in PATH)
// On Windows, might need full path if not in global environment
const cmd = `pg_dump "${dbUrl}" > "${backupFile}"`;

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.warn(`Warning: ${stderr}`);
    }
    console.log(`Backup completed successfully: ${backupFile}`);
});
