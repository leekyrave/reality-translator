import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/core';
import { User } from '@/libs/orm/entities';
import { AuthPayload, JwtPayload, TokenType } from '@/auth/types';
import { LoginDto, RegisterDto } from '@/auth/dto';
import { MeResponseDto } from '@/auth/dto/me.dto';
import { TemplateService } from '@/template/template.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly templateService: TemplateService,
  ) {}

  async register({ email, password, name }: RegisterDto): Promise<TokenType> {
    try {
      const user = this.em.create(User, { email, password, name });

      await this.em.persist(user).flush();

      await this.templateService.seedForUser(user.id);

      return this.signJwt({ sub: user.id, email: user.email });
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException)
        throw new ConflictException('Email already exists');
      this.logger.error(error);
      throw new BadRequestException('Unknown error. Developers notified about this.');
    }
  }

  async login({ email, name, password }: LoginDto): Promise<TokenType> {
    const user = await this.em
      .findOne(User, {
        $or: [{ email }, { name }],
      })
      .catch(() => {
        throw new InternalServerErrorException('Database error');
      });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const verified = await user.verifyPassword(password);
    if (!verified) throw new UnauthorizedException('Invalid credentials');

    return this.signJwt({ sub: user.id, email: user.email });
  }

  async me(user: AuthPayload): Promise<MeResponseDto> {
    return await this.em.findOneOrFail(User, { id: user.id });
  }

  signJwt(payload: JwtPayload): TokenType {
    return { token: this.jwtService.sign(payload) };
  }
}
