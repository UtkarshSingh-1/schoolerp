import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from '../presentation/realtime.gateway';

@Injectable()
export class BroadcastTenantEventUseCase {
    constructor(
        @Inject(forwardRef(() => RealtimeGateway))
        private readonly gateway: RealtimeGateway
    ) { }

    async execute(schoolId: string, eventName: string, payload: any): Promise<void> {
        console.log(`[REALTIME] Broadcasting ${eventName} to school ${schoolId}`);
        this.gateway.emitToSchool(schoolId, eventName, payload);
    }
}
