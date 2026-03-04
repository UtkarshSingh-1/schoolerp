const pool = require('../config/db');

exports.getMarks = async (req, res) => {
    const { studentId } = req.query;
    const { id: userId, role } = req.user;

    try {
        // Find the student record associated with this user
        // Note: In our current schema, users and students are separate tables.
        // We assume email is the common link or we need to add a user_id to student.
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        const userEmail = userRes.rows[0]?.email;

        // If STUDENT role, they can ONLY see marks for themselves
        if (role === 4) { // STUDENT_ROLE_ID is 4
            const marks = await pool.query(`
                SELECT m.*, s.name as subject_name 
                FROM marks m
                JOIN subjects s ON m.subject_id = s.id
                JOIN students st ON m.student_id = st.id
                WHERE st.email = $1
            `, [userEmail]);
            return res.json(marks.rows);
        }

        // If TEACHER or ADMIN, they can filter by studentId
        const marks = await pool.query(`
            SELECT m.*, s.name as subject_name, st.first_name, st.last_name
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            JOIN students st ON m.student_id = st.id
            WHERE m.student_id = $1
        `, [studentId]);
        res.json(marks.rows);
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).json({ message: 'Error fetching marks' });
    }
};

exports.upsertMarks = async (req, res) => {
    const { studentId, subjectId, marksObtained, totalMarks, examType, academicYear } = req.body;
    const teacherId = req.user.id;

    try {
        await pool.query(`
            INSERT INTO marks (student_id, subject_id, teacher_id, marks_obtained, total_marks, exam_type, academic_year)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (student_id, subject_id, exam_type) DO UPDATE
            SET marks_obtained = EXCLUDED.marks_obtained,
                total_marks = EXCLUDED.total_marks
        `, [studentId, subjectId, teacherId, marksObtained, totalMarks, examType, academicYear]);

        res.json({ success: true, message: 'Marks updated successfully' });
    } catch (error) {
        console.error('Error upserting marks:', error);
        res.status(500).json({ message: 'Failed to update marks' });
    }
};
