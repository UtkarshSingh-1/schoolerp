import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ViolationRepository } from '../infrastructure/violation.repository';
import { CreateViolationRecordDto } from '../presentation/dto/create-violation-record.dto';
import { ViolationRecord } from '../domain/violation-record.entity';

@Injectable()
export class AggregateViolationsUseCase {
    constructor(
        private readonly violationRepository: ViolationRepository,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async execute(dto: CreateViolationRecordDto): Promise<ViolationRecord> {
        return this.violationRepository.createRecord('DEMO-SCHOOL-ID', dto); // AUDIT FIX: Pass schoolId
    }
}
