import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './domain/leave-request.entity';
import { LeaveRepository } from './infrastructure/leave.repository';
import { ApplyLeaveUseCase } from './use-cases/apply-leave.use-case';
import { LeaveController } from './presentation/leave.controller';

@Module({
    imports: [TypeOrmModule.forFeature([LeaveRequest])],
    controllers: [LeaveController],
    providers: [
        LeaveRepository,
        ApplyLeaveUseCase,
    ],
    exports: [ApplyLeaveUseCase],
})
export class LeaveModule { }
