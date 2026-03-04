import { IsNumber, IsString, IsNotEmpty, IsUUID, Min, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @IsString()
    @IsNotEmpty()
    idempotencyKey: string;
}
