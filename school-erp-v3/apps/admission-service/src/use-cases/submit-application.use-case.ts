import { Injectable } from '@nestjs/common';
import { AdmissionRepository } from '../infrastructure/admission.repository';
import { SubmitApplicationDto } from '../presentation/dto/submit-application.dto';
import { Admission } from '../domain/admission.entity';

@Injectable()
export class SubmitApplicationUseCase {
    constructor(private readonly admissionRepository: AdmissionRepository) { }

    async execute(schoolId: string, dto: SubmitApplicationDto): Promise<Admission> {
        return this.admissionRepository.createApplication(schoolId, {
            ...dto,
        });
    }
}
