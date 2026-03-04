import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from './domain/admission.entity';
import { AdmissionRepository } from './infrastructure/admission.repository';
import { SubmitApplicationUseCase } from './use-cases/submit-application.use-case';
import { ListApplicationsUseCase } from './use-cases/list-applications.use-case';
import { ReviewApplicationUseCase } from './use-cases/review-application.use-case';
import { AdmissionController } from './presentation/admission.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Admission])],
    controllers: [AdmissionController],
    providers: [
        AdmissionRepository,
        SubmitApplicationUseCase,
        ListApplicationsUseCase,
        ReviewApplicationUseCase,
    ],
    exports: [SubmitApplicationUseCase, ListApplicationsUseCase],
})
export class AdmissionModule { }
