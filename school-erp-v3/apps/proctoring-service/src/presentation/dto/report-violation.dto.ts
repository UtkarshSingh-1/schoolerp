import { IsNotEmpty, IsEnum, IsUUID, IsString, IsOptional, IsObject } from 'class-validator';
import { ViolationType } from '../../domain/proctoring-event.entity';

export class ReportViolationDto {
    @IsUUID()
    @IsNotEmpty()
    examAttemptId: string;

    @IsEnum(ViolationType)
    @IsNotEmpty()
    type: ViolationType;

    @IsString()
    @IsOptional()
    details?: string;

    @IsObject()
    @IsOptional()
    metadata?: any;
}
