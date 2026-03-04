require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');
const emailService = require('./src/services/emailService');

(async () => {
  const targetEmails = ['singabhinav748@gmail.com', 'singhabhinav748@gmail.com'];
  let user = null;

  for (const e of targetEmails) {
    const r = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.employee_id, r.name as role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE lower(u.email) = lower($1)
       LIMIT 1`,
      [e]
    );
    if (r.rows[0]) {
      user = r.rows[0];
      break;
    }
  }

  if (!user) {
    console.log(JSON.stringify({ success: false, message: 'Teacher account not found for provided emails.' }));
    await pool.end();
    process.exit(0);
  }

  const tempPassword = `Welcome@${new Date().getFullYear()}`;
  const hash = await bcrypt.hash(tempPassword, 10);

  await pool.query(
    `UPDATE users
     SET password_hash = $1,
         must_change_password = true,
         must_upload_photo = true
     WHERE id = $2`,
    [hash, user.id]
  );

  const accountId = user.employee_id || user.id;
  const mail = await emailService.sendWelcomeEmail(
    user.email,
    user.full_name || 'Teacher',
    accountId,
    tempPassword,
    user.role || 'TEACHER'
  );

  console.log(JSON.stringify({
    success: true,
    email: user.email,
    role: user.role,
    accountId,
    tempPassword,
    mail
  }));

  await pool.end();
})().catch(async (e) => {
  console.error(e);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
});
