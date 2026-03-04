require('dotenv').config({ path: '../school-erp-v3/.env' });
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false, servername: process.env.DB_HOSTNAME }
});

client.connect().then(async () => {
    const results = {};

    // Users columns
    const userCols = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;");
    results.users_columns = userCols.rows;

    // Roles columns
    const roleCols = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='roles' ORDER BY ordinal_position;");
    results.roles_columns = roleCols.rows;

    // Actual user record used for login
    const user = await client.query("SELECT * FROM users WHERE email='superadmin@demo.com';");
    results.superadmin = user.rows[0];

    // Actual role record
    const role = await client.query("SELECT * FROM roles WHERE id='00000000-0000-0000-0000-111111111111';");
    results.superadmin_role = role.rows[0];

    // Test the EXACT queries the RbacGuard runs
    const guardUser = await client.query(
        "SELECT * FROM users WHERE id = $1 AND school_id = $2 AND is_active = true LIMIT 1",
        [user.rows[0]?.id, '66666666-6666-6666-6666-666666666666']
    ).catch(e => ({ error: e.message }));
    results.guard_user_query = guardUser.rows || guardUser;

    if (guardUser.rows && guardUser.rows[0]) {
        const guardRole = await client.query(
            "SELECT * FROM roles WHERE id = $1 AND school_id = $2 LIMIT 1",
            [guardUser.rows[0].role_id, '66666666-6666-6666-6666-666666666666']
        ).catch(e => ({ error: e.message }));
        results.guard_role_query = guardRole.rows || guardRole;
    }

    fs.writeFileSync('rbac_diagnostic.json', JSON.stringify(results, null, 2));
    console.log('Done! Results saved to rbac_diagnostic.json');
    client.end();
}).catch(e => {
    console.error('ERROR:', e.message);
    fs.writeFileSync('rbac_diagnostic.json', JSON.stringify({ error: e.message }));
});
