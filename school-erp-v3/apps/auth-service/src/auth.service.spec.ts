import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '@app/auth-service/infrastructure/user.repository';
import { JwtService } from '@nestjs/jwt';

describe('AuthService (Audit Fixes)', () => {
    let service: AuthService;
    let repo: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        repo = module.get<UserRepository>(UserRepository);
    });

    it('should validate user against DB and return null if inactive', async () => {
        repo.findOne = jest.fn().mockResolvedValue({ id: '1', isActive: false });
        // @ts-ignore
        const result = await service.validateUser('test@school.com', 'password');
        expect(result).toBeNull();
    });

    it('should return user object if credentials and status are valid', async () => {
        repo.findOne = jest.fn().mockResolvedValue({ id: '1', isActive: true, passwordHash: 'hashed' });
        // Mock password compare...
        // ...
    });
});
