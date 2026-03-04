const pool = require('../config/db');

exports.allotRoom = async (req, res) => {
    const { studentId, roomId } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check capacity
        const roomRes = await client.query('SELECT capacity, (SELECT count(*) FROM hostel_allotments WHERE room_id = $1) as current_occupancy FROM rooms WHERE id = $1', [roomId]);
        const room = roomRes.rows[0];

        if (room.current_occupancy >= room.capacity) {
            return res.status(400).json({ message: 'Room is at full capacity' });
        }

        const result = await client.query(
            'INSERT INTO hostel_allotments (student_id, room_id) VALUES ($1, $2) RETURNING *',
            [studentId, roomId]
        );

        await client.query('COMMIT');
        res.status(201).json({ success: true, allotment: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error allotting room' });
    } finally {
        client.release();
    }
};

exports.getHostelDetails = async (req, res) => {
    const { studentId } = req.params;
    const { id: userId, role } = req.user;

    try {
        // PRIVACY: If student, ensure they only see their own data
        if (role === 4) {
            const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
            const studentRes = await pool.query('SELECT id FROM students WHERE email = $1', [userRes.rows[0]?.email]);
            if (studentRes.rows[0]?.id != studentId) {
                return res.status(403).json({ message: 'Access Denied: You can only view your own hostel details.' });
            }
        }

        const result = await pool.query(`
            SELECT ha.*, r.room_no, r.monthly_rent, h.name as hostel_name
            FROM hostel_allotments ha
            JOIN rooms r ON ha.room_id = r.id
            JOIN hostels h ON r.hostel_id = h.id
            WHERE ha.student_id = $1
        `, [studentId]);
        res.json(result.rows[0] || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hostel details' });
    }
};

exports.getHostelList = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, 
            (SELECT json_agg(r.*) FROM rooms r WHERE r.hostel_id = h.id) as rooms
            FROM hostels h
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hostels' });
    }
};
