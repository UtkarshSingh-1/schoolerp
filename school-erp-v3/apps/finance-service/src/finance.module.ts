import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './domain/transaction.entity';
import { AuditModule } from '@app/audit-service/audit.module';
import { Wallet } from './domain/wallet.entity';
import { Ledger } from './domain/ledger.entity';
import { FeeStructure } from './domain/fee-structure.entity';
import { FeeAllocation } from './domain/fee-allocation.entity';
import { SalaryStructure } from './domain/salary-structure.entity';
import { PayrollRecord } from './domain/payroll-record.entity';
import { FinanceRepository } from './infrastructure/finance.repository';
import { ProcessPaymentUseCase } from './use-cases/process-payment.use-case';
import { FinanceController } from './presentation/finance.controller';
import { FeeManagementService } from './use-cases/fee-management.service';
import { FeeManagementController } from './presentation/fee-management.controller';
import { PayrollService } from './use-cases/payroll.service';
import { PayrollController } from './presentation/payroll.controller';
import { BackupService } from './use-cases/backup.service';
import { BackupController } from './presentation/backup.controller';

import { SecurityModule } from '@libs/security/security.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, Wallet, Ledger, FeeStructure, FeeAllocation, SalaryStructure, PayrollRecord]),
        AuditModule,
        SecurityModule,
    ],
    providers: [FinanceRepository, ProcessPaymentUseCase, FeeManagementService, PayrollService, BackupService],
    controllers: [FinanceController, FeeManagementController, PayrollController, BackupController],
    exports: [FeeManagementService],
})
export class FinanceModule { }
