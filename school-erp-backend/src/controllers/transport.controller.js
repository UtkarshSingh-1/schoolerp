const pool = require('../config/db');

// Transport Routes logic
exports.createRoute = async (req, res) => {
    const { routeName, monthlyCost } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO routes (route_name, monthly_cost) VALUES ($1, $2) RETURNING *',
            [routeName, monthlyCost]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating route' });
    }
};

// Allotment logic
exports.allotTransport = async (req, res) => {
    const { studentId, routeId, vehicleId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO transport_allotments (student_id, route_id, vehicle_id) VALUES ($1, $2, $3) RETURNING *',
            [studentId, routeId, vehicleId]
        );
        res.status(201).json({ success: true, allotment: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error allotting transport' });
    }
};

exports.getTransportDetails = async (req, res) => {
    const { studentId } = req.params;
    const { id: userId, role } = req.user;

    try {
        // PRIVACY: If student, ensure they only see their own data
        if (role === 4) {
            const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
            const studentRes = await pool.query('SELECT id FROM students WHERE email = $1', [userRes.rows[0]?.email]);
            if (studentRes.rows[0]?.id != studentId) {
                return res.status(403).json({ message: 'Access Denied: You can only view your own transport details.' });
            }
        }

        const result = await pool.query(`
            SELECT t.*, r.route_name, r.monthly_cost, v.vehicle_no, v.driver_name
            FROM transport_allotments t
            JOIN routes r ON t.route_id = r.id
            JOIN vehicles v ON t.vehicle_id = v.id
            WHERE t.student_id = $1
        `, [studentId]);
        res.json(result.rows[0] || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transport details' });
    }
};

exports.getRoutes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM routes');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching routes' });
    }
};

exports.getVehicles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicles');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
};
