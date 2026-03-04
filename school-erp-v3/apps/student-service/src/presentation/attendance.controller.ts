import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { AttendanceService } from '../use-cases/attendance.service';
import { SyncBiometricLogsUseCase, RawBiometricLog } from '../use-cases/sync-biometric-logs.use-case';
import { AttendanceStatus } from '../domain/attendance.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly syncUseCase: SyncBiometricLogsUseCase
    ) { }

    @Post('mark')
    @RequirePermissions('attendance.mark')
    async markAttendance(@Body() dto: { studentId: string; date: string; status: AttendanceStatus; remarks?: string }, @Req() req: any) {
        return this.attendanceService.mark(req.user.schoolId, req.user.id, dto);
    }

    @Post('sync')
    @RequirePermissions('attendance.mark')
    async syncBiometric(@Body() logs: RawBiometricLog[], @Req() req: any) {
        // If logs not provided in body, simulate from current students for demo
        const inputLogs = logs?.length ? logs : [];
        return this.syncUseCase.execute(req.user.schoolId, inputLogs);
    }

    @Get()
    @RequirePermissions('attendance.read')
    async getAttendance(@Query('studentId') studentId: string, @Query('date') date: string, @Req() req: any) {
        return this.attendanceService.find(req.user.schoolId, studentId, date);
    }

    @Get('summary')
    @RequirePermissions('attendance.read')
    async getSummary(@Query('studentId') studentId: string, @Req() req: any) {
        return this.attendanceService.getSummary(req.user.schoolId, studentId);
    }
}
