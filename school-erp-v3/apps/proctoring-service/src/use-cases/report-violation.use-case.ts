import { Injectable } from '@nestjs/common';
import { ProctoringRepository } from '../infrastructure/proctoring.repository';
import { ReportViolationDto } from '../presentation/dto/report-violation.dto';
import { ProctoringEvent } from '../domain/proctoring-event.entity';

@Injectable()
export class ReportViolationUseCase {
    constructor(private readonly proctoringRepository: ProctoringRepository) { }

    async execute(schoolId: string, dto: ReportViolationDto): Promise<ProctoringEvent> {
        const event = await this.proctoringRepository.createEvent(schoolId, {
            ...dto,
        });

        // TODO: Trigger RealtimeService event via RealtimeModule
        // console.log(`[PROCTORING] Violation detected in school ${event.schoolId} for attempt ${dto.examAttemptId}`);

        return event;
    }
}
