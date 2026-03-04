const pool = require('../config/db');

// Create a new request (Student Only)
exports.createRequest = async (req, res) => {
    const { serviceType, requestDetails } = req.body;
    const { id: userId, role } = req.user;

    try {
        // Find student_id from user_id (email link)
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        const email = userRes.rows[0]?.email;
        const studentRes = await pool.query('SELECT id FROM students WHERE email = $1', [email]);

        if (studentRes.rows.length === 0) return res.status(404).json({ message: 'Student record not found' });
        const studentId = studentRes.rows[0].id;

        const result = await pool.query(
            'INSERT INTO service_requests (student_id, service_type, request_details) VALUES ($1, $2, $3) RETURNING *',
            [studentId, serviceType, requestDetails]
        );
        res.status(201).json({ success: true, request: result.rows[0] });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Failed to submit request' });
    }
};

// Rename for clarity and route matching
exports.getAllRequests = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, s.first_name, s.last_name, s.student_id as student_code
            FROM service_requests r
            JOIN students s ON r.student_id = s.id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

exports.getStudentRequests = async (req, res) => {
    const { studentId: requestStudentId } = req.params;
    const { id: userId, role } = req.user;

    try {
        const result = await pool.query(`
            SELECT r.* 
            FROM service_requests r
            JOIN students s ON r.student_id = s.id
            WHERE s.student_id = $1
            ORDER BY r.created_at DESC
        `, [requestStudentId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students requests' });
    }
};

// Approve/Reject (Admin Only)
exports.updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, adminComment } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const requestRes = await client.query('SELECT * FROM service_requests WHERE id = $1', [requestId]);
        if (requestRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
        const request = requestRes.rows[0];

        // Update status
        await client.query(
            'UPDATE service_requests SET status = $1, admin_comment = $2, updated_at = NOW() WHERE id = $3',
            [status, adminComment, requestId]
        );

        // If APPROVED, perform the allotment
        if (status === 'APPROVED') {
            const details = request.request_details;
            if (request.service_type === 'TRANSPORT') {
                await client.query(
                    'INSERT INTO transport_allotments (student_id, route_id, vehicle_id) VALUES ($1, $2, $3)',
                    [request.student_id, details.route_id, details.vehicle_id || 1]
                );
            } else if (request.service_type === 'HOSTEL') {
                await client.query(
                    'INSERT INTO hostel_allotments (student_id, room_id) VALUES ($1, $2)',
                    [request.student_id, details.room_id]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: `Request ${status}` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Failed to update request' });
    } finally {
        client.release();
    }
};
