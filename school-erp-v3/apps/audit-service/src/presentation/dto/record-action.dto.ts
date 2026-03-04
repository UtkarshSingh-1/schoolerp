import { IsNotEmpty, IsEnum, IsUUID, IsString, IsOptional, IsObject } from 'class-validator';
import { AuditAction } from '../../domain/audit-log.entity';

export class RecordActionDto {
    @IsEnum(AuditAction)
    @IsNotEmpty()
    action: AuditAction;

    @IsString()
    @IsNotEmpty()
    resource: string;

    @IsUUID()
    @IsOptional()
    resourceId?: string;

    @IsObject()
    @IsOptional()
    payload?: any;
}
