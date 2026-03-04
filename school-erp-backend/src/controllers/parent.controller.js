const pool = require('../config/db');

exports.getChildren = async (req, res) => {
    try {
        const studentRes = await pool.query('SELECT * FROM students WHERE parent_email = $1', [req.user.email]);
        res.json(studentRes.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching children' });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT fp.*, s.first_name, s.last_name 
            FROM fee_payments fp 
            JOIN students s ON fp.student_id = s.id 
            WHERE s.parent_email = $1`, [req.user.email]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.getChildInfo = async (req, res) => {
    const parentEmail = req.user.email;
    try {
        // Find student where parent_email matches
        const studentRes = await pool.query(
            'SELECT * FROM students WHERE parent_email = $1',
            [parentEmail]
        );

        if (studentRes.rows.length === 0) {
            return res.status(404).json({ message: 'No child associated with this account' });
        }

        const student = studentRes.rows[0];

        // Fetch Attendance Summary
        const attendanceRes = await pool.query(
            "SELECT status, COUNT(*) FROM attendance_records WHERE student_id = $1 GROUP BY status",
            [student.id]
        );

        // Fetch Latest Marks
        const marksRes = await pool.query(
            `SELECT m.*, s.name as subject_name 
             FROM marks m
             JOIN subjects s ON m.subject_id = s.id
             WHERE m.student_id = $1
             ORDER BY m.created_at DESC LIMIT 5`,
            [student.id]
        );

        res.json({
            student,
            attendance: attendanceRes.rows,
            recentMarks: marksRes.rows
        });
    } catch (error) {
        console.error('Parent Portal Error:', error);
        res.status(500).json({ message: 'Error fetching child information' });
    }
};
