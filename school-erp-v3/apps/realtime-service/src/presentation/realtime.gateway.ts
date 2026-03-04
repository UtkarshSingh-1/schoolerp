import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { BroadcastTenantEventUseCase } from '../use-cases/broadcast-tenant-event.use-case';
import { WsJwtGuard } from '../../../../libs/security/src/ws-jwt.guard';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseGuards(WsJwtGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(RealtimeGateway.name);
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly broadcastTenantEventUseCase: BroadcastTenantEventUseCase
    ) { }

    async handleConnection(client: Socket) {
        // IDEMPOTENCY/SECURITY: Data is now injected by WsJwtGuard from verified JWT
        const user = client.data.user;

        if (!user || !user.schoolId) {
            this.logger.error(`Unauthorized connection attempt: ${client.id}`);
            client.disconnect();
            return;
        }

        // 2. Join a tenant-specific room (Strict Isolation)
        const roomName = `school_${user.schoolId}`;
        await client.join(roomName);

        this.logger.log(`[REALTIME] User ${user.id} from school ${user.schoolId} joined room: ${roomName}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[REALTIME] Client ${client.id} disconnected`);
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket, data: any) {
        return { event: 'pong', data };
    }

    // Helper for internal use-cases to emit to a room
    emitToSchool(schoolId: string, event: string, payload: any) {
        this.server.to(`school_${schoolId}`).emit(event, payload);
    }
}
