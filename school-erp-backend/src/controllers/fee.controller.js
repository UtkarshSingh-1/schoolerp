const pool = require('../config/db');

exports.getFeeLedger = async (req, res) => {
    const { studentId } = req.params;
    try {
        // 1. Get Base Tuition
        const tuitionRes = await pool.query(`
            SELECT fs.amount 
            FROM students s
            JOIN fee_structures fs ON s.class = fs.class
            WHERE s.id = $1
        `, [studentId]);
        const tuition = tuitionRes.rows[0]?.amount || 0;

        // 2. Get Transport Fee
        const transportRes = await pool.query(`
            SELECT r.monthly_cost 
            FROM transport_allotments ta
            JOIN routes r ON ta.route_id = r.id
            WHERE ta.student_id = $1
        `, [studentId]);
        const transport = transportRes.rows[0]?.monthly_cost || 0;

        // 3. Get Hostel Rent
        const hostelRes = await pool.query(`
            SELECT r.monthly_rent 
            FROM hostel_allotments ha
            JOIN rooms r ON ha.room_id = r.id
            WHERE ha.student_id = $1
        `, [studentId]);
        const hostel = hostelRes.rows[0]?.monthly_rent || 0;

        const totalDue = parseFloat(tuition) + parseFloat(transport) + parseFloat(hostel);

        res.json({
            studentId,
            breakdown: {
                tuition: parseFloat(tuition),
                transport: parseFloat(transport),
                hostel: parseFloat(hostel)
            },
            totalMonthlyDue: totalDue
        });
    } catch (error) {
        console.error('Error fetching ledger:', error);
        res.status(500).json({ message: 'Error generating fee ledger' });
    }
};

exports.payFee = async (req, res) => {
    const { studentId, amount, paymentMode } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO fee_payments (student_id, amount_paid, payment_mode) VALUES ($1, $2, $3) RETURNING *',
            [studentId, amount, paymentMode]
        );
        res.status(201).json({ success: true, payment: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Payment processing failed' });
    }
};
exports.getFeeStructure = async (req, res) => {
    const className = req.params.class || req.query.class;
    try {
        const query = className ? 'SELECT * FROM fee_structures WHERE class = $1' : 'SELECT * FROM fee_structures';
        const params = className ? [className] : [];
        const result = await pool.query(query, params);
        res.json(className ? result.rows[0] : result.rows);
    } catch (error) {
        console.error('Error fetching fee structure:', error);
        res.status(500).json({ message: 'Error fetching fee structure' });
    }
};
