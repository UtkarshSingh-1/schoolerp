import { IsNotEmpty, IsEnum, IsString, IsEmail } from 'class-validator';
import { NotificationChannel } from '../../domain/notification-log.entity';

export class SendNotificationDto {
    @IsString()
    @IsNotEmpty()
    recipient: string;

    @IsEnum(NotificationChannel)
    @IsNotEmpty()
    channel: NotificationChannel;

    @IsString()
    @IsNotEmpty()
    content: string;
}
