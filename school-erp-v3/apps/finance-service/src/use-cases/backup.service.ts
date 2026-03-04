import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BackupService {
    constructor(private dataSource: DataSource) { }

    async exportData(schoolId: string): Promise<any> {
        const entities = ['FeeStructure', 'FeeAllocation', 'SalaryStructure', 'PayrollRecord', 'Transaction', 'Ledger'];
        const backup: any = { timestamp: new Date(), schoolId, data: {} };

        for (const entity of entities) {
            const repo = this.dataSource.getRepository(entity);
            backup.data[entity] = await repo.find({ where: { schoolId } });
        }

        return backup;
    }
}
