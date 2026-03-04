import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CreateTeacherUseCase } from '../use-cases/create-teacher.use-case';
import { ListTeachersUseCase } from '../use-cases/list-teachers.use-case';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('teachers')
@UseGuards(RbacGuard)
export class TeacherController {
    constructor(
        private readonly createTeacherUseCase: CreateTeacherUseCase,
        private readonly listTeachersUseCase: ListTeachersUseCase
    ) { }

    @Post()
    @RequirePermissions('teacher.create')
    async create(@Body() createTeacherDto: CreateTeacherDto, @Req() req: any) {
        return this.createTeacherUseCase.execute(req.user.schoolId, req.user.id, createTeacherDto);
    }

    @Get()
    @RequirePermissions('teacher.read')
    async findAll(@Req() req: any) {
        return this.listTeachersUseCase.execute(req.user.schoolId);
    }
}
