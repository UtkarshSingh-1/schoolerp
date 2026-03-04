const pool = require('../config/db');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');

async function getNextEmployeeId(client, schoolId) {
    const serialRes = await client.query(
        `SELECT COALESCE(MAX(NULLIF(regexp_replace(COALESCE(employee_id, ''), '\\D', '', 'g'), '')::BIGINT), 0) AS max_serial
         FROM users
         WHERE school_id = $1 AND employee_id IS NOT NULL`,
        [schoolId]
    );
    const nextSerial = (serialRes.rows[0]?.max_serial || 0) + 1;
    return `EMP-${String(nextSerial).padStart(2, '0')}`;
}

exports.createStaff = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        role,
        aadhaarNumber,
        phone,
        gender,
        dateOfBirth,
        address,
        qualification,
        emergencyContact,
        joiningDate
    } = req.body;
    const schoolId = req.header('x-school-id') || '66666666-6666-6666-6666-666666666666';
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        if (!fullName || !email || !role) {
            return res.status(400).json({ success: false, message: 'full name, email and role are required.' });
        }

        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`staff-admission-${schoolId}`]);
        const employeeId = await getNextEmployeeId(client, schoolId);

        const existingUser = await client.query(
            'SELECT id FROM users WHERE school_id = $1 AND email = $2 LIMIT 1',
            [schoolId, email]
        );
        if (existingUser.rows[0]) {
            return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
        }

        const tempPassword = `${firstName}@${new Date().getFullYear()}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const roleRes = await client.query(
            "SELECT id FROM roles WHERE name = $1 AND school_id = $2 LIMIT 1",
            [role.toUpperCase(), schoolId]
        );
        const roleId = roleRes.rows[0]?.id || 3;
        const enforceFirstLoginSetup = ['TEACHER', 'STAFF'].includes(role.toUpperCase());

        await client.query(
            `INSERT INTO users (
                school_id, role_id, email, password_hash, full_name, is_active, profile_photo,
                employee_id, phone, aadhaar_number, gender, date_of_birth, address, qualification, emergency_contact, joining_date,
                must_change_password, must_upload_photo
             )
             VALUES ($1, $2, $3, $4, $5, true, NULL, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [
                schoolId, roleId, email, hashedPassword, fullName,
                employeeId, phone || null, aadhaarNumber || null, gender || null, dateOfBirth || null, address || null,
                qualification || null, emergencyContact || null, joiningDate || null, enforceFirstLoginSetup, enforceFirstLoginSetup
            ]
        );

        await client.query('COMMIT');

        // Send asynchronously so UI response stays fast.
        emailService.sendWelcomeEmail(email, `${firstName} ${lastName}`, employeeId, tempPassword, role)
            .catch((err) => console.error('Staff credential email failed:', err));

        res.status(201).json({
            success: true,
            message: `${role} account created successfully.`,
            employeeId: employeeId,
            loginEmail: email
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating staff:', error);
        res.status(500).json({ success: false, message: 'Failed to create staff account.' });
    } finally {
        client.release();
    }
};

exports.getAllStaff = async (req, res) => {
    const schoolId = req.header('x-school-id') || '66666666-6666-6666-6666-666666666666';
    try {
        const staff = await pool.query(`
            SELECT
                u.id,
                u.employee_id,
                u.full_name,
                r.name as role,
                u.email,
                u.phone,
                u.is_active,
                u.profile_photo,
                u.aadhaar_number,
                u.gender,
                u.date_of_birth,
                u.address,
                u.qualification,
                u.emergency_contact,
                u.joining_date
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name != 'STUDENT' AND u.school_id = $1
            ORDER BY u.created_at DESC
        `, [schoolId]);
        res.json(staff.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff' });
    }
};
