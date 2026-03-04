const pool = require('../config/db');

exports.getAdminMetrics = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        // 1. Total Students
        const studentsRes = await pool.query('SELECT COUNT(*) FROM students');

        // 2. Fees Collected (Current Month)
        const feesRes = await pool.query(
            'SELECT SUM(amount_paid) FROM fee_payments WHERE payment_date >= $1',
            [monthStart]
        );

        // 3. Salary Liability (Current Month)
        const salaryRes = await pool.query(
            'SELECT SUM(net_salary) FROM salaries WHERE paid_date >= $1',
            [monthStart]
        );

        // 4. Attendance Today
        const attendanceRes = await pool.query(
            "SELECT COUNT(*) FROM attendance_records WHERE marked_at::date = $1 AND status = 'PRESENT'",
            [today]
        );

        res.json({
            students: parseInt(studentsRes.rows[0].count),
            monthlyRevenue: parseFloat(feesRes.rows[0].sum || 0),
            monthlyExpense: parseFloat(salaryRes.rows[0].sum || 0),
            attendanceToday: parseInt(attendanceRes.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics' });
    }
};
