import { Injectable } from '@nestjs/common';
import { getSchoolId } from '../../../../libs/tenant/src/tenant.context';
import { FinanceRepository } from '../infrastructure/finance.repository';
import { ProcessPaymentDto } from '../presentation/dto/process-payment.dto';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';

@Injectable()
export class ProcessPaymentUseCase {
    constructor(private readonly financeRepository: FinanceRepository) { }

    async execute(
        dto: ProcessPaymentDto,
        studentId: string,
        ipAddress: string,
        userAgent: string
    ): Promise<Transaction> {
        const schoolId = getSchoolId();
        if (!schoolId) throw new Error('Tenant context missing');

        return this.financeRepository.processPayment(schoolId, {
            ...dto,
            studentId,
            status: TransactionStatus.COMPLETED,
            createdBy: studentId, // Simplified for this context
        }, studentId, ipAddress, userAgent);
    }
}
