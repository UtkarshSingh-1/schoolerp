import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { EnqueueNotificationUseCase } from '../use-cases/enqueue-notification.use-case';
import { SendNotificationDto } from './dto/send-notification.dto';
import { RbacGuard } from '@libs/rbac/rbac.guard';
import { RequirePermissions } from '@libs/rbac/permissions.decorator';
import { NotificationRepository } from '../infrastructure/notification.repository';

@Controller('notifications')
@UseGuards(RbacGuard)
export class NotificationController {
    constructor(
        private readonly enqueueNotificationUseCase: EnqueueNotificationUseCase,
        private readonly notificationRepository: NotificationRepository
    ) { }

    @Post('send')
    @RequirePermissions('notification.send')
    async send(@Body() dto: SendNotificationDto) {
        return this.enqueueNotificationUseCase.execute(dto);
    }

    @Get('history')
    @RequirePermissions('notification.read')
    async findAll(@Req() req: any) {
        return this.notificationRepository.findBySchool(req.user.schoolId);
    }
}
