import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViolationRecord } from './domain/violation-record.entity';
import { ViolationRepository } from './infrastructure/violation.repository';
import { AggregateViolationsUseCase } from './use-cases/aggregate-violations.use-case';
import { ViolationController } from './presentation/violation.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ViolationRecord])],
    controllers: [ViolationController],
    providers: [
        ViolationRepository,
        AggregateViolationsUseCase,
    ],
    exports: [AggregateViolationsUseCase],
})
export class ViolationTrackerModule { }
