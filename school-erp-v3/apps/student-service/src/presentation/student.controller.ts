import { Controller, Post, Get, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CreateStudentUseCase } from '../use-cases/create-student.use-case';
import { CreateStudentDto } from './dto/create-student.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { JwtAuthGuard } from '@libs/security';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { CreateManualStudentUseCase } from '../use-cases/create-manual-student.use-case';
import { CreateManualStudentDto } from './dto/create-manual-student.dto';
import { Throttle } from '@nestjs/throttler';
import { PaginationDto } from '@libs/common/dto/pagination.dto';
import { ListStudentsUseCase } from '../use-cases/list-students.use-case';

@Controller('students')
@UseGuards(JwtAuthGuard, RbacGuard)
export class StudentController {
    constructor(
        private readonly createStudentUseCase: CreateStudentUseCase,
        private readonly createManualStudentUseCase: CreateManualStudentUseCase,
        private readonly listStudentsUseCase: ListStudentsUseCase
    ) { }

    @Post('manual')
    @Throttle({ admission: { limit: 3, ttl: 60000 } })
    @RequirePermissions('students:create_manual')
    async manualAdmission(@Body() dto: CreateManualStudentDto, @Req() req: any) {
        return this.createManualStudentUseCase.execute(req.user.schoolId, req.user.id, dto);
    }

    @Post()
    @RequirePermissions('student.create')
    async create(@Body() createStudentDto: CreateStudentDto, @Req() req: any) {
        return this.createStudentUseCase.execute(req.user.schoolId, createStudentDto, req.user.id);
    }

    @Get()
    @RequirePermissions('student.read')
    async findAll(@Req() req: any) {
        return this.listStudentsUseCase.execute(req.user.schoolId);
    }

    @Get(':id')
    @RequirePermissions('student.read')
    async findOne(@Param('id') id: string) {
        // Implement get use case
        return {};
    }
}
