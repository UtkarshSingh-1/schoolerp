import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { SubmitApplicationUseCase } from '../use-cases/submit-application.use-case';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { ListApplicationsUseCase } from '../use-cases/list-applications.use-case';
import { ReviewApplicationUseCase } from '../use-cases/review-application.use-case';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';

@Controller('admissions')
@UseGuards(RbacGuard)
export class AdmissionController {
    constructor(
        private readonly submitApplicationUseCase: SubmitApplicationUseCase,
        private readonly listApplicationsUseCase: ListApplicationsUseCase,
        private readonly reviewApplicationUseCase: ReviewApplicationUseCase
    ) { }

    @Post('apply')
    @RequirePermissions('admission.apply')
    async apply(@Body() dto: SubmitApplicationDto, @Req() req: any) {
        return this.submitApplicationUseCase.execute(req.user.schoolId, dto);
    }

    @Get()
    @RequirePermissions('admission.read')
    async findAll(@Req() req: any) {
        return this.listApplicationsUseCase.execute(req.user.schoolId);
    }

    @Patch(':id/review')
    @RequirePermissions('admission.review')
    async review(@Param('id') id: string, @Body() reviewDto: any, @Req() req: any) {
        return this.reviewApplicationUseCase.execute(
            req.user.schoolId,
            id,
            reviewDto.status,
            reviewDto.remarks,
            req.user.id
        );
    }
}
