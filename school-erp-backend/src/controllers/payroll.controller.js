const pool = require('../config/db');

exports.generateMonthlyPayroll = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get all active staff (non-students)
        const staffRes = await client.query(`
            SELECT u.id, u.first_name, u.last_name, r.name as role 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name != 'STUDENT' AND u.is_active = TRUE
        `);

        const payrollResults = [];

        // 2. generate salary record for each staff for the current month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        for (const staff of staffRes.rows) {
            // Check if payroll already generated for this month
            const existingRes = await client.query(
                'SELECT id FROM salaries WHERE user_id = $1 AND paid_date >= $2',
                [staff.id, firstDayOfMonth]
            );

            if (existingRes.rows.length === 0) {
                // Mock calculation logic (In real app, fetch from employment_contracts table)
                let basic = 3000;
                let allowance = 500;
                if (staff.role === 'ADMIN' || staff.role === 'SUPER_ADMIN') {
                    basic = 5000;
                    allowance = 1000;
                } else if (staff.role === 'TEACHER') {
                    basic = 4000;
                    allowance = 800;
                }

                const deduction = 200;
                const netSalary = basic + allowance - deduction;

                const result = await client.query(
                    `INSERT INTO salaries (user_id, basic, allowance, deduction, net_salary, paid_date)
                     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
                    [staff.id, basic, allowance, deduction, netSalary]
                );
                payrollResults.push(result.rows[0]);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Payroll processed for ${payrollResults.length} staff members.`,
            processedCount: payrollResults.length
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payroll generation error:', error);
        res.status(500).json({ message: 'Failed to generate payroll' });
    } finally {
        client.release();
    }
};

exports.getPayrollHistory = async (req, res) => {
    const { staffId } = req.params;
    try {
        let query = `
            SELECT s.*, u.first_name, u.last_name, r.name as role
            FROM salaries s
            JOIN users u ON s.user_id = u.id
            JOIN roles r ON u.role_id = r.id
        `;
        const params = [];
        if (staffId) {
            query += ' WHERE s.user_id = $1';
            params.push(staffId);
        }
        query += ' ORDER BY s.paid_date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payroll history' });
    }
};
