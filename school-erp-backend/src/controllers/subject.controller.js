const pool = require('../config/db');
const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';

const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;

exports.getAllSubjects = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const result = await pool.query(
            'SELECT * FROM subjects WHERE school_id = $1 ORDER BY name ASC',
            [schoolId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
};

exports.createSubject = async (req, res) => {
    const { name, code } = req.body;
    const schoolId = getSchoolId(req);

    if (!name || !code) {
        return res.status(400).json({ message: 'name and code are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO subjects (school_id, name, code) VALUES ($1, $2, $3) RETURNING *',
            [schoolId, name, code]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Subject code already exists' });
        }
        console.error('Error creating subject:', error);
        res.status(500).json({ message: 'Error creating subject' });
    }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    try {
        await pool.query('DELETE FROM subjects WHERE id = $1 AND school_id = $2', [id, schoolId]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Error deleting subject' });
    }
};
