import { AuthService } from '@/auth/auth.service';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LoginDto, LoginResponseDto, RegisterDto, RegisterResponseDto } from '@/auth/dto';
import type { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly cookieOptions: CookieOptions = {};
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookieOptions = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24h in ms
    };
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const result = await this.authService.register(dto);

    res.cookie('token', result.token, this.cookieOptions);

    return {};
  }

  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(dto);
    res.cookie('token', result.token, this.cookieOptions);

    return {};
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', this.cookieOptions);
  }
}
