import { Controller, Post, Get, Body, UseGuards, Req, Query, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LectureSchedule } from '../domain/lecture-schedule.entity';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Injectable()
export class LectureScheduleService {
    private repository: Repository<LectureSchedule>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(LectureSchedule);
    }

    async create(schoolId: string, data: Partial<LectureSchedule>): Promise<LectureSchedule> {
        const schedule = this.repository.create({ ...data, schoolId });
        return this.repository.save(schedule);
    }

    async find(schoolId: string, filters: { classId?: string, teacherId?: string }): Promise<LectureSchedule[]> {
        const where: any = { schoolId };
        if (filters.classId) where.classId = filters.classId;
        if (filters.teacherId) where.teacherId = filters.teacherId;

        return this.repository.find({ where });
    }
}

@Controller('timetable')
@UseGuards(JwtAuthGuard, RbacGuard)
export class LectureScheduleController {
    constructor(private readonly service: LectureScheduleService) { }

    @Post()
    @RequirePermissions('schedule.create')
    async create(@Body() dto: any, @Req() req: any) {
        return this.service.create(req.user.schoolId, dto);
    }

    @Get()
    @RequirePermissions('schedule.read')
    async findAll(@Query('classId') classId: string, @Query('teacherId') teacherId: string, @Req() req: any) {
        return this.service.find(req.user.schoolId, { classId, teacherId });
    }
}
