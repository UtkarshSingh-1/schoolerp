const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.email=$1`,
            [email]
        );

        if (userResult.rows.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword)
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role_name,
                mustChangePassword: user.must_change_password,
                mustUploadPhoto: user.must_upload_photo,
                email: user.email
            },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '8h' }
        );
        const needsFirstLoginSetupRoles = ['STUDENT', 'TEACHER', 'STAFF'];
        const mustUploadPhoto = needsFirstLoginSetupRoles.includes(user.role_name)
            ? (user.must_upload_photo || !user.profile_photo)
            : !!user.must_upload_photo;
        const onboardingRequired = (needsFirstLoginSetupRoles.includes(user.role_name))
            ? (!!user.must_change_password || mustUploadPhoto)
            : !!user.must_change_password;

        res.json({
            token,
            user: {
                id: user.id,
                name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                role: user.role_name,
                mustChangePassword: !!user.must_change_password,
                mustUploadPhoto,
                onboardingRequired
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
        if (!newPassword || String(newPassword).length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1, must_change_password = $2 WHERE id = $3',
            [hashedPassword, false, req.user.id]
        );
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password Change Error:', error);
        res.status(500).json({ success: false, message: 'Password update failed' });
    }
};

exports.completeOnboarding = async (req, res) => {
    const { newPassword, profilePhoto } = req.body;
    const roleName = req.user.roleName;

    if (!['STUDENT', 'TEACHER', 'STAFF'].includes(roleName)) {
        return res.status(403).json({ success: false, message: 'Onboarding update is restricted to student/teacher/staff.' });
    }

    if (!newPassword || String(newPassword).length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (!profilePhoto || String(profilePhoto).trim() === '') {
        return res.status(400).json({ success: false, message: 'Profile photo is required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            `UPDATE users
             SET password_hash = $1,
                 profile_photo = $2,
                 must_change_password = false,
                 must_upload_photo = false
             WHERE id = $3`,
            [hashedPassword, profilePhoto, req.user.id]
        );

        res.json({ success: true, message: 'Onboarding completed successfully.' });
    } catch (error) {
        console.error('Onboarding completion error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete onboarding.' });
    }
};
