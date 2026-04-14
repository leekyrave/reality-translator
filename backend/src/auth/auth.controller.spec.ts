import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

const mockAuthService = {
  register: jest.fn().mockResolvedValue({ token: 'jwt-token' }),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'NODE_ENV') return 'development';
    if (key === 'JWT_EXPIRATION_TIME') return 86400000;
  }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should set cookie and return empty response', async () => {
      const mockRes = {
        cookie: jest.fn(),
      };

      const result = await controller.register(
        { email: 'test@test.com', password: 'password123', name: 'testuser' },
        mockRes as any,
      );

      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        }),
      );
      expect(result).toEqual({});
    });
  });
});
