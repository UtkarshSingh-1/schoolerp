import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../domain/attendance.entity';

@Injectable()
export class AttendanceService {
    private readonly repository: Repository<Attendance>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Attendance);
    }

    async mark(schoolId: string, teacherId: string, data: { studentId: string; date: string; status: AttendanceStatus; remarks?: string; lectureId?: string }): Promise<Attendance> {
        let attendance = await this.repository.findOne({
            where: {
                schoolId,
                studentId: data.studentId,
                date: data.date,
                lectureId: data.lectureId || undefined
            }
        });

        if (!attendance) {
            attendance = this.repository.create({
                ...data,
                schoolId,
                markedBy: teacherId
            });
        } else {
            Object.assign(attendance, data);
            attendance.markedBy = teacherId;
        }

        return this.repository.save(attendance);
    }

    async find(schoolId: string, studentId?: string, date?: string): Promise<Attendance[]> {
        const where: any = { schoolId };
        if (studentId) where.studentId = studentId;
        if (date) where.date = date;

        return this.repository.find({
            where,
            order: { date: 'DESC' }
        });
    }

    async getSummary(schoolId: string, studentId: string) {
        const history = await this.find(schoolId, studentId);
        const presentCount = history.filter(a => a.status === AttendanceStatus.PRESENT).length;

        return {
            total: history.length,
            present: presentCount,
            percentage: history.length > 0 ? (presentCount / history.length) * 100 : 0,
            history: history.slice(0, 5)
        };
    }

    async getDailyAttendanceRate(schoolId: string, date: string): Promise<number> {
        const attendance = await this.repository.find({
            where: { schoolId, date }
        });

        if (attendance.length === 0) return 0;

        const presentCount = attendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
        return (presentCount / attendance.length) * 100;
    }
}
