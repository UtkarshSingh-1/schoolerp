import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { StudentRepository } from '@app/student-service/infrastructure/student.repository';
import { FeeManagementService } from '@app/finance-service/use-cases/fee-management.service';
import { ListApplicationsUseCase } from '@app/admission-service/use-cases/list-applications.use-case';
import { AttendanceService } from '@app/student-service/use-cases/attendance.service';
import { DataSource } from 'typeorm';
import { Class } from '@app/student-service/domain/class.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RbacGuard)
export class DashboardController {
    constructor(
        private readonly dataSource: DataSource,
        private readonly studentRepository: StudentRepository,
        private readonly feeManagementService: FeeManagementService,
        private readonly listApplicationsUseCase: ListApplicationsUseCase,
        private readonly attendanceService: AttendanceService,
    ) { }

    @Get('metrics')
    @RequirePermissions('dashboard.read')
    async getMetrics(@Req() req: any) {
        const schoolId = req.user.schoolId;
        const today = new Date().toISOString().split('T')[0];

        const [studentsCount, admissions, monthlyRevenue, attendanceToday] = await Promise.all([
            this.studentRepository.count({ where: { schoolId } }),
            this.listApplicationsUseCase.execute(schoolId),
            this.feeManagementService.calculateMonthlyRevenue(schoolId),
            this.attendanceService.getDailyAttendanceRate(schoolId, today)
        ]);

        return {
            students: studentsCount,
            monthlyRevenue,
            monthlyExpense: monthlyRevenue * 0.3, // Heuristic for now
            attendanceToday: Math.round(attendanceToday),
            recentAdmissionsCount: admissions.length
        };
    }

    @Get('recent-admissions')
    @RequirePermissions('dashboard.read')
    async getRecentAdmissions(@Req() req: any) {
        const admissions = await this.listApplicationsUseCase.execute(req.user.schoolId);

        // Resolve classes
        const classIds = [...new Set(admissions.map(a => a.targetClassId))];
        const classes = await this.dataSource.getRepository(Class).findByIds(classIds);
        const classMap = new Map(classes.map(c => [c.id, `${c.name}-${c.section}`]));

        return admissions.slice(0, 5).map(a => ({
            name: a.applicantFullName,
            class: classMap.get(a.targetClassId) || 'N/A',
            status: a.status,
            date: a.createdAt
        }));
    }
}
