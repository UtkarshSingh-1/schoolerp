const ReportingService = require('../services/reportingService');
const pool = require('../config/db');

exports.getReportCard = async (req, res) => {
    const { studentId } = req.params;

    try {
        // 1. Fetch Student
        const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = studentRes.rows[0];

        // 2. Fetch Marks
        const marksRes = await pool.query(`
            SELECT m.*, s.name as subject_name 
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id = $1
        `, [studentId]);

        const reportData = ReportingService.generateReportData(student, marksRes.rows);

        // Set PDF headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Report_Card_${student.student_id}.pdf`);

        ReportingService.generatePDF(reportData, res);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report card' });
    }
};
