import { Injectable } from '@nestjs/common';
import { LeaveRepository } from '../infrastructure/leave.repository';
import { ApplyLeaveDto } from '../presentation/dto/apply-leave.dto';
import { LeaveRequest } from '../domain/leave-request.entity';

@Injectable()
export class ApplyLeaveUseCase {
    constructor(private readonly leaveRepository: LeaveRepository) { }

    async execute(schoolId: string, dto: ApplyLeaveDto, userId: string): Promise<LeaveRequest> {
        return this.leaveRepository.createLeaveRequest(schoolId, {
            ...dto,
            userId,
        });
    }
}
