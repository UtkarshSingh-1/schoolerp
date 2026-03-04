import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class StartExamDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}
