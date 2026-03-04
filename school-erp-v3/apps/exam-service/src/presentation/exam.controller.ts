import { Controller, Post, Get, Body, UseGuards, Req, Ip, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StartExamUseCase } from '../use-cases/start-exam.use-case';
import { StartExamDto } from './dto/start-exam.dto';
import { SubmitAnswerUseCase } from '../use-cases/submit-answer.use-case';
import { FinalizeExamUseCase } from '../use-cases/finalize-exam.use-case';
import { ListExamResultsUseCase } from '../use-cases/list-exam-results.use-case';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { JwtAuthGuard } from '@libs/security/jwt-auth.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { ExamRepository } from '../infrastructure/exam.repository';

@Controller('exams')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ExamController {
  constructor(
    private readonly startExamUseCase: StartExamUseCase,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly finalizeExamUseCase: FinalizeExamUseCase,
    private readonly listExamResultsUseCase: ListExamResultsUseCase,
    private readonly examRepository: ExamRepository
  ) { }

  @Post('start')
  @RequirePermissions('exam.attempt')
  async start(@Body() dto: StartExamDto, @Req() req: any, @Ip() ip: string) {
    return this.startExamUseCase.execute(dto, req.user.id, ip);
  }

  @Post('submit-answer')
  @Throttle({ short: { limit: 20, ttl: 60000 } })
  @RequirePermissions('exam.attempt')
  async submitAnswer(
    @Body() dto: { attemptId: string; questionId: string; answer: string },
    @Req() req: any
  ) {
    return this.submitAnswerUseCase.execute(dto.attemptId, dto.questionId, dto.answer);
  }

  @Post('submit')
  @RequirePermissions('exam.attempt')
  async submit(@Body() dto: { attemptId: string }, @Req() req: any) {
    return this.finalizeExamUseCase.execute(req.user.schoolId, dto.attemptId);
  }

  @Get()
  @RequirePermissions('exam.read')
  async findAll(@Req() req: any) {
    return this.examRepository.findBySchool(req.user.schoolId);
  }

  @Get(':id/results')
  @RequirePermissions('exam.read')
  async getResults(@Req() req: any, @Param('id') id: string) {
    return this.listExamResultsUseCase.execute(req.user.schoolId, id);
  }
}
