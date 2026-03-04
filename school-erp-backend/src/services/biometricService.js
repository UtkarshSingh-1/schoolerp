/**
 * Biometric Log Processing Service
 */

class BiometricService {
    /**
     * Process a batch of raw device logs
     * @param {Array} logs - [{ studentId, scanTime, deviceId }]
     * @param {Object} shiftConfig - { startTime: '08:00', lateGracePeriod: 15 }
     * @returns {Array} - Processed attendance records
     */
    static processLogs(logs, shiftConfig = { startTime: '08:00', lateGracePeriod: 15 }) {
        return logs.map(log => {
            const scanDate = new Date(log.scanTime);
            const scanTimeStr = scanDate.toTimeString().substring(0, 5);

            let status = 'PRESENT';

            const [startH, startM] = shiftConfig.startTime.split(':').map(Number);
            const [scanH, scanM] = scanTimeStr.split(':').map(Number);

            const scanTotalMinutes = scanH * 60 + scanM;
            const startTotalMinutes = startH * 60 + startM;

            if (scanTotalMinutes > startTotalMinutes + shiftConfig.lateGracePeriod) {
                status = 'LATE';
            }

            if (scanTotalMinutes > startTotalMinutes + 120) { // More than 2 hours late
                status = 'HALF_DAY';
            }

            return {
                studentId: log.studentId,
                date: scanDate.toISOString().split('T')[0],
                time: scanTimeStr,
                status,
                deviceId: log.deviceId
            };
        });
    }

    /**
     * Aggregate logs to determine first check-in of the day
     * @param {Array} rawLogs 
     */
    static aggregateDailyLogs(rawLogs) {
        const dailyMap = new Map();

        rawLogs.forEach(log => {
            const dateKey = `${log.studentId}-${new Date(log.scanTime).toISOString().split('T')[0]}`;
            if (!dailyMap.has(dateKey) || new Date(log.scanTime) < new Date(dailyMap.get(dateKey).scanTime)) {
                dailyMap.set(dateKey, log);
            }
        });

        return Array.from(dailyMap.values());
    }
}

module.exports = BiometricService;
