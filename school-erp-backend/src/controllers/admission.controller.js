const pool = require('../config/db');

const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';

const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;

exports.apply = async (req, res) => {
  const schoolId = getSchoolId(req);
  const { applicantFullName, email, phone, targetClassId, metadata } = req.body;

  if (!applicantFullName || !targetClassId) {
    return res.status(400).json({ message: 'applicantFullName and targetClassId are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO admissions ("schoolId", "applicantFullName", email, phone, "targetClassId", status, metadata)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
       RETURNING *`,
      [schoolId, applicantFullName, email || null, phone || null, targetClassId, metadata || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Admission apply error:', error);
    res.status(500).json({ message: 'Failed to submit admission application' });
  }
};

exports.list = async (req, res) => {
  const schoolId = getSchoolId(req);
  try {
    const result = await pool.query(
      `SELECT * FROM admissions
       WHERE "schoolId" = $1
       ORDER BY "createdAt" DESC`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Admission list error:', error);
    res.status(500).json({ message: 'Failed to fetch admissions' });
  }
};

exports.review = async (req, res) => {
  const schoolId = getSchoolId(req);
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE admissions
       SET status = $1, remarks = $2, "updatedAt" = now(), "updatedBy" = $3
       WHERE id = $4 AND "schoolId" = $5
       RETURNING *`,
      [status, remarks || null, req.user?.id || null, id, schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Admission review error:', error);
    res.status(500).json({ message: 'Failed to review admission' });
  }
};
