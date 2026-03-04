const pool = require('../config/db');
const DEFAULT_SCHOOL_ID = '66666666-6666-6666-6666-666666666666';
const getSchoolId = (req) => req.header('x-school-id') || DEFAULT_SCHOOL_ID;

const VALID_DAYS = new Set(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_RE = /^\d{1,2}:\d{2}(:\d{2})?$/;

const normalizeTime = (v) => (v && v.length === 5 ? `${v}:00` : v);

exports.getTimetable = async (req, res) => {
    const { classId } = req.query;
    const schoolId = getSchoolId(req);

    try {
        let result;
        if (classId) {
            result = await pool.query(
                `SELECT *
                 FROM lectures
                 WHERE school_id = $1 AND class_id = $2
                 ORDER BY day_of_week, start_time`,
                [schoolId, classId]
            );
        } else {
            result = await pool.query(
                `SELECT *
                 FROM lectures
                 WHERE school_id = $1
                 ORDER BY day_of_week, start_time`,
                [schoolId]
            );
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ message: 'Error fetching timetable' });
    }
};

exports.getTeacherSchedule = async (req, res) => {
    const { teacherId } = req.params;
    const schoolId = getSchoolId(req);
    try {
        const result = await pool.query(
            `SELECT * FROM lectures
             WHERE school_id = $1 AND (teacher_id::text = $2 OR teacher_name ILIKE $3)
             ORDER BY day_of_week, start_time`,
            [schoolId, teacherId, `%${teacherId}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching teacher schedule:', error);
        res.status(500).json({ message: 'Error fetching teacher schedule' });
    }
};

exports.createSlot = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { classId, dayOfWeek, startTime, endTime, subject, teacherName, teacherId, roomNumber } = req.body;

        if (!classId || !dayOfWeek || !startTime || !endTime || !subject) {
            return res.status(400).json({ message: 'classId, dayOfWeek, startTime, endTime and subject are required' });
        }

        const day = String(dayOfWeek).toUpperCase().trim();
        const start = normalizeTime(String(startTime).trim());
        const end = normalizeTime(String(endTime).trim());

        if (!VALID_DAYS.has(day)) {
            return res.status(400).json({ message: 'Invalid dayOfWeek. Use MONDAY..SUNDAY' });
        }
        if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM or HH:MM:SS' });
        }
        if (start >= end) {
            return res.status(400).json({ message: 'endTime must be later than startTime' });
        }

        let resolvedClassId = classId;
        if (!UUID_RE.test(String(classId))) {
            const raw = String(classId).trim();
            const split = raw.split('-').map((x) => x.trim()).filter(Boolean);
            if (split.length >= 2) {
                const className = split[0];
                const section = split[1];
                const classRes = await pool.query(
                    'SELECT id FROM classes WHERE school_id = $1 AND name = $2 AND section = $3 LIMIT 1',
                    [schoolId, className, section]
                );
                if (!classRes.rows[0]) {
                    return res.status(400).json({ message: 'Invalid classId: class not found' });
                }
                resolvedClassId = classRes.rows[0].id;
            } else {
                return res.status(400).json({ message: 'Invalid classId format' });
            }
        } else {
            const classRes = await pool.query(
                'SELECT id FROM classes WHERE school_id = $1 AND id = $2 LIMIT 1',
                [schoolId, classId]
            );
            if (!classRes.rows[0]) {
                return res.status(400).json({ message: 'Invalid classId: class not found' });
            }
        }

        await pool.query(
            `INSERT INTO lectures (
                school_id, class_id, day_of_week, start_time, end_time, subject, teacher_id, teacher_name, room_number, status
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'SCHEDULED')
             ON CONFLICT (school_id, class_id, day_of_week, start_time)
             DO UPDATE SET
                end_time = EXCLUDED.end_time,
                subject = EXCLUDED.subject,
                teacher_id = EXCLUDED.teacher_id,
                teacher_name = EXCLUDED.teacher_name,
                room_number = EXCLUDED.room_number,
                status = 'SCHEDULED',
                updated_at = NOW()`,
            [schoolId, resolvedClassId, day, start, end, String(subject).trim(), teacherId || null, teacherName || null, roomNumber || null]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating slot:', error);
        if (error?.code === '22P02') {
            return res.status(400).json({ message: 'Invalid identifier or time format' });
        }
        if (error?.code === '23503') {
            return res.status(400).json({ message: 'Invalid foreign key reference in timetable data' });
        }
        res.status(500).json({ message: error?.message || 'Error creating slot' });
    }
};
