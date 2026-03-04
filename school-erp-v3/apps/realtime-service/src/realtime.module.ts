import { Module } from '@nestjs/common';
import { RealtimeGateway } from './presentation/realtime.gateway';
import { BroadcastTenantEventUseCase } from './use-cases/broadcast-tenant-event.use-case';
import { SecurityModule } from '../../../libs/security/src/security.module';

@Module({
    imports: [SecurityModule],
    providers: [
        RealtimeGateway,
        BroadcastTenantEventUseCase,
    ],
    exports: [RealtimeGateway, BroadcastTenantEventUseCase],
})
export class RealtimeModule { }
