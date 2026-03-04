const pool = require('../config/db');

exports.getAllExams = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM entrance_exams ORDER BY exam_date DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams' });
    }
};

exports.createExam = async (req, res) => {
    const { title, date, startTime, duration, totalMarks } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO entrance_exams (title, exam_date, start_time, duration_minutes, total_marks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, date, startTime, duration, totalMarks]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam' });
    }
};

exports.getExamDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM entrance_exams WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Exam not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam details' });
    }
};

exports.getExamResults = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT er.*, a.first_name, a.last_name, a.applied_class
            FROM exam_results er
            JOIN applicants a ON er.applicant_id = a.id
            WHERE er.exam_id = $1
            ORDER BY er.score DESC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

exports.evaluateExams = async (req, res, next) => {
    const { id } = req.params; // Exam ID from URL
    const { seats } = req.body;

    if (!seats) {
        return res.status(400).json({ message: 'Seat count required for evaluation' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch all results for this exam, ordered by score
        const resultsRes = await client.query(`
            SELECT id, applicant_id FROM exam_results 
            WHERE exam_id = $1 
            ORDER BY score DESC
        `, [id]);

        const results = resultsRes.rows;
        const meritList = [];

        // 2. Assign Statuses
        for (let i = 0; i < results.length; i++) {
            const status = i < seats ? 'SELECTED' : 'WAITLISTED';

            // Update exam_results table
            await client.query(
                'UPDATE exam_results SET status = $1 WHERE id = $2',
                [status, results[i].id]
            );

            // Update applicants table
            await client.query(
                'UPDATE applicants SET status = $1 WHERE id = $2',
                [status, results[i].applicant_id]
            );

            meritList.push({
                resultId: results[i].id,
                applicantId: results[i].applicant_id,
                status
            });
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            summary: {
                total: results.length,
                selected: Math.min(seats, results.length),
                waitlisted: Math.max(0, results.length - seats)
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};
