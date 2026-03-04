import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../infrastructure/audit.repository';
import { RecordActionDto } from '../presentation/dto/record-action.dto';
import { AuditLog } from '../domain/audit-log.entity';

@Injectable()
export class RecordActionUseCase {
    constructor(private readonly auditRepository: AuditRepository) { }

    async execute(schoolId: string, dto: RecordActionDto, userId: string, ipAddress: string, userAgent: string): Promise<AuditLog> {
        return this.auditRepository.createLog(schoolId, {
            ...dto,
            userId,
            ipAddress,
            userAgent,
        });
    }
}
