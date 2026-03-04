const BiometricService = require('../services/biometricService');

exports.getAttendanceReport = async (req, res, next) => {
    res.json({ message: 'Attendance report fetched' });
};

exports.markAttendance = async (req, res, next) => {
    res.json({ message: 'Attendance marked successfully' });
};

exports.syncBiometricLogs = async (req, res, next) => {
    const pool = require('../config/db');
    try {
        // In a real scenario, this would poll a device or sftp. 
        // Here we'll just process what's already in the biometric_logs table for today.

        const today = new Date().toISOString().split('T')[0];
        const logsRes = await pool.query(
            'SELECT * FROM biometric_logs WHERE scan_time::date = $1',
            [today]
        );

        if (logsRes.rows.length === 0) {
            return res.json({ success: true, processed: 0, message: 'No logs found for today.' });
        }

        const uniqueLogs = BiometricService.aggregateDailyLogs(logsRes.rows);
        const attendanceRecords = BiometricService.processLogs(uniqueLogs);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const rec of attendanceRecords) {
                // Upsert into attendance_records (Simplified: we'll use a dummy lecture_id 1 for now or find one)
                await client.query(`
                    INSERT INTO attendance_records (student_id, status, marked_at)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT DO NOTHING
                `, [rec.studentId, rec.status]);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        res.json({
            success: true,
            processed: attendanceRecords.length,
            records: attendanceRecords,
            summary: {
                present: attendanceRecords.filter(r => r.status === 'PRESENT').length,
                late: attendanceRecords.filter(r => r.status === 'LATE').length,
                halfDay: attendanceRecords.filter(r => r.status === 'HALF_DAY').length
            }
        });
    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ message: 'Sync failed' });
    }
};
