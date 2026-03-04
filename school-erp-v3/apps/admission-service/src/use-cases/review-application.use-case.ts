import { Injectable, NotFoundException } from '@nestjs/common';
import { AdmissionRepository } from '../infrastructure/admission.repository';
import { Admission, AdmissionStatus } from '../domain/admission.entity';

@Injectable()
export class ReviewApplicationUseCase {
    constructor(private readonly admissionRepository: AdmissionRepository) { }

    async execute(schoolId: string, id: string, status: AdmissionStatus, remarks?: string, processedBy?: string): Promise<Admission> {
        const application = await this.admissionRepository.findOneScoped(schoolId, id);
        if (!application) {
            throw new NotFoundException('Application not found');
        }

        application.status = status;
        if (remarks) application.remarks = remarks;
        if (processedBy) application.processedBy = processedBy;

        return this.admissionRepository.save(application);
    }
}
