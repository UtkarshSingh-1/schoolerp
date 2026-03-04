import { Injectable } from '@nestjs/common';
import { AdmissionRepository } from '../infrastructure/admission.repository';
import { Admission } from '../domain/admission.entity';

@Injectable()
export class ListApplicationsUseCase {
    constructor(private readonly admissionRepository: AdmissionRepository) { }

    async execute(schoolId: string): Promise<Admission[]> {
        return this.admissionRepository.findBySchool(schoolId);
    }
}
