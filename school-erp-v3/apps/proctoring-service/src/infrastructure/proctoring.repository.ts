import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProctoringEvent } from '../domain/proctoring-event.entity';
import { getSchoolId } from '@libs/tenant/tenant.context';

@Injectable()
export class ProctoringRepository extends Repository<ProctoringEvent> {
    constructor(private dataSource: DataSource) {
        super(ProctoringEvent, dataSource.createEntityManager());
    }

    async createEvent(schoolId: string, data: Partial<ProctoringEvent>): Promise<ProctoringEvent> {
        const event = this.create({
            ...data,
            schoolId: schoolId,
        });
        return this.save(event);
    }

    async findByAttempt(schoolId: string, examAttemptId: string): Promise<ProctoringEvent[]> {
        return this.find({
            where: { schoolId, examAttemptId },
            order: { createdAt: 'DESC' }
        });
    }
}
