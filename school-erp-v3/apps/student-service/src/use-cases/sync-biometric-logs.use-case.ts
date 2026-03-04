import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../domain/attendance.entity';

export interface RawBiometricLog {
    studentId: string;
    scanTime: string; // ISO string
    deviceId: string;
}

@Injectable()
export class SyncBiometricLogsUseCase {
    private readonly repository: Repository<Attendance>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Attendance);
    }

    async execute(schoolId: string, logs: RawBiometricLog[]): Promise<{ processed: number }> {
        // Default shift config
        const shiftConfig = { startTime: '08:00', lateGracePeriod: 15 };

        // Group logs by student and date (keep only the earliest scan for check-in)
        const dailyLogs = new Map<string, RawBiometricLog>();
        logs.forEach(log => {
            const date = new Date(log.scanTime).toISOString().split('T')[0];
            const key = `${log.studentId}-${date}`;

            if (!dailyLogs.has(key) || new Date(log.scanTime) < new Date(dailyLogs.get(key)!.scanTime)) {
                dailyLogs.set(key, log);
            }
        });

        let processedCount = 0;

        for (const [key, log] of dailyLogs.entries()) {
            const scanDate = new Date(log.scanTime);
            const scanTimeStr = scanDate.toTimeString().substring(0, 5);
            const dateKey = scanDate.toISOString().split('T')[0];

            let status = AttendanceStatus.PRESENT;

            const [startH, startM] = shiftConfig.startTime.split(':').map(Number);
            const [scanH, scanM] = scanTimeStr.split(':').map(Number);

            const scanTotalMinutes = scanH * 60 + scanM;
            const startTotalMinutes = startH * 60 + startM;

            if (scanTotalMinutes > startTotalMinutes + shiftConfig.lateGracePeriod) {
                status = AttendanceStatus.LATE;
            }

            // More than 2 hours late could be "ABSENT" or special status, keeping LATE for now
            // as per AttendanceStatus enum.

            // Upsert attendance record
            let attendance = await this.repository.findOne({
                where: { schoolId, studentId: log.studentId, date: dateKey }
            });

            if (!attendance) {
                attendance = this.repository.create({
                    schoolId,
                    studentId: log.studentId,
                    date: dateKey,
                    status,
                    remarks: `Synced from Biometric Device: ${log.deviceId}`,
                    markedBy: '00000000-0000-0000-0000-000000000001' // System User
                });
            } else {
                // Only update if it was PRESENT and now LATE, or if it's the same day
                // We don't want to overwrite manual ABSENT marks usually, 
                // but sync is often authoritative for check-in.
                attendance.status = status;
                attendance.remarks = `Updated from Biometric Sync: ${log.deviceId}`;
            }

            await this.repository.save(attendance);
            processedCount++;
        }

        return { processed: processedCount };
    }
}
