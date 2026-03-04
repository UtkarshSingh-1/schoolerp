const pool = require('../config/db');
const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';
const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;

exports.getAllClasses = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const result = await pool.query(`
            SELECT
                c.id,
                c.school_id,
                c.name,
                c.section,
                c.maximum_capacity,
                COUNT(s.id)::INT as current_enrollment,
                c.created_at,
                c.updated_at
            FROM classes c 
            LEFT JOIN students s ON s.current_class_id = c.id
            WHERE c.school_id = $1
            GROUP BY c.id, c.school_id, c.name, c.section, c.maximum_capacity, c.created_at, c.updated_at
            ORDER BY c.name, c.section
        `, [schoolId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createClass = async (req, res) => {
    const { name, section, maximumCapacity } = req.body;
    const schoolId = getSchoolId(req);
    try {
        const result = await pool.query(
            'INSERT INTO classes (school_id, name, section, maximum_capacity) VALUES ($1, $2, $3, $4) RETURNING *',
            [schoolId, name, section, maximumCapacity]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Class and Section already exists' });
        }
        console.error('Error creating class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateClass = async (req, res) => {
    const { id } = req.params;
    const { maximumCapacity } = req.body;
    const schoolId = getSchoolId(req);
    try {
        const result = await pool.query(
            'UPDATE classes SET maximum_capacity = $1 WHERE id = $2 AND school_id = $3 RETURNING *',
            [maximumCapacity, id, schoolId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Class not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteClass = async (req, res) => {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    try {
        await pool.query('DELETE FROM classes WHERE id = $1 AND school_id = $2', [id, schoolId]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
