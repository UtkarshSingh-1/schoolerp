import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './domain/audit-log.entity';
import { AuditRepository } from './infrastructure/audit.repository';
import { RecordActionUseCase } from './use-cases/record-action.use-case';
import { AuditController } from './presentation/audit.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditController],
    providers: [
        AuditRepository,
        RecordActionUseCase,
    ],
    exports: [RecordActionUseCase],
})
export class AuditModule { }
