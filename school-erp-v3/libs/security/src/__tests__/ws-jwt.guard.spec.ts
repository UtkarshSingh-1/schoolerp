import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../ws-jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

describe('WsJwtGuard', () => {
    let guard: WsJwtGuard;
    let jwtService: JwtService;

    const mockJwtService = {
        verify: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WsJwtGuard,
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        guard = module.get<WsJwtGuard>(WsJwtGuard);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow non-ws requests (fail-safe)', async () => {
        const mockContext = {
            getType: () => 'http',
        } as any;

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
    });

    it('should throw WsException if token is missing', async () => {
        const mockContext = {
            getType: () => 'ws',
            switchToWs: () => ({
                getClient: () => ({
                    handshake: { headers: {}, query: {} },
                }),
            }),
        } as any;

        await expect(guard.canActivate(mockContext)).rejects.toThrow(WsException);
    });

    it('should extract token from Bearer header and validate', async () => {
        const mockPayload = { sub: 'user-1', email: 'test@test.com', schoolId: 'school-1' };
        mockJwtService.verify.mockReturnValue(mockPayload);

        const mockClient = {
            handshake: {
                headers: { authorization: 'Bearer valid-token' },
                query: {},
            },
            data: {},
        };

        const mockContext = {
            getType: () => 'ws',
            switchToWs: () => ({
                getClient: () => mockClient,
            }),
        } as any;

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
        expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
        expect((mockClient.data as any).user).toEqual({
            id: 'user-1',
            email: 'test@test.com',
            schoolId: 'school-1',
        });
    });

    it('should extract token from query string as fallback', async () => {
        const mockPayload = { sub: 'user-2', schoolId: 'school-2' };
        mockJwtService.verify.mockReturnValue(mockPayload);

        const mockClient = {
            handshake: {
                headers: {},
                query: { token: 'query-token' },
            },
            data: {},
        };

        const mockContext = {
            getType: () => 'ws',
            switchToWs: () => ({
                getClient: () => mockClient,
            }),
        } as any;

        const result = await guard.canActivate(mockContext);

        expect(result).toBe(true);
        expect(jwtService.verify).toHaveBeenCalledWith('query-token');
    });

    it('should throw WsException if token is invalid', async () => {
        mockJwtService.verify.mockImplementation(() => {
            throw new Error('Invalid signature');
        });

        const mockContext = {
            getType: () => 'ws',
            switchToWs: () => ({
                getClient: () => ({
                    handshake: {
                        headers: { authorization: 'Bearer bad-token' },
                    },
                    data: {},
                }),
            }),
        } as any;

        await expect(guard.canActivate(mockContext)).rejects.toThrow(WsException);
    });
});
