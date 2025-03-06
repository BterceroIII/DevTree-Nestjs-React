import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { PasswordHasherService } from '../common/services/password-hasher.service';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDto } from './dto/token-response.dto';
import { add } from 'date-fns';
import { RefreshToken } from './entities/refresh-token.entity';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { NormalizeHandle } from '../common/services/normalizedHandle.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly passwordHasher: PasswordHasherService,
    private readonly normalizeHandle: NormalizeHandle,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      return await this.userRepository.manager.transaction(async (manager) => {
        const { email, password, handle } = createUserDto;

        const isEmailRegistered = await this.userRepository.findOne({
          where: { email },
        });
        if (isEmailRegistered) {
          throw new BadRequestException('Email already registered');
        }

        const isHandleRegistered = await this.userRepository.findOne({
          where: { handle },
        });
        if (isHandleRegistered) {
          throw new BadRequestException('Handle already registered');
        }

        const hashedPassword = await this.passwordHasher.hashPassword(password);

        const userEntity = manager.create(User, {
          ...createUserDto,
          password: hashedPassword,
        });

        const savedUser = await manager.save(userEntity);

        const responseDto = plainToInstance(CreateUserResponseDto, savedUser, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });

        return responseDto;
      });
    } catch (error) {
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    try {
      const { email, password } = loginUserDto;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const isPasswordValid = await this.passwordHasher.comparePasswords(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }

      const refreshToken = this.getRefreshToken({ id: user.id });
      const token = this.getJwtToken({ id: user.id });

      const expireAt = add(new Date(), { days: 7 });

      const savedRefreshToken = this.refreshTokenRepository.create({
        refreshToken,
        expiresAt: expireAt,
        user,
      });
      await this.refreshTokenRepository.save(savedRefreshToken);

      const userResponse = plainToInstance(
        LoginUserResponseDto,
        { ...user, token, refreshToken },
        {
          excludeExtraneousValues: true,
        },
      );
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  private getJwtToken(payload: JwtPayload): string {
    //const expiresIn = Number(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'));
    const secret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    return this.jwtService.sign(payload, { secret, expiresIn: '71h' });
  }

  private getRefreshToken(payload: JwtPayload): string {
    // const expiresIn = Number(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'));
    const secret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
    return this.jwtService.sign(payload, { secret, expiresIn: '7d' });
  }

  findAll() {
    return `This action returns all auth`;
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async getUserByHandle(handle: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.handle',
        'user.name',
        'user.description',
        'user.image',
        'user.links',
      ])
      .where('user.handle = :handle', { handle })
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async searchUserByHandle(handle: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.handle) = LOWER(:handle)', { handle })
      .getOne();
  
    if (user) {
      throw new BadRequestException(`${handle} ya está registrado`);
    }
  
    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    try {
      const normalizedHandle = this.normalizeHandle.normalizeHandle(
        updateUserDto.handle,
      );
      updateUserDto.handle = normalizedHandle;

      const userConflict = await this.userRepository.findOne({
        where: { handle: normalizedHandle },
      });
      if (userConflict && userConflict.id !== userId) {
        throw new BadRequestException('Nombre de usuario no disponible');
      }

      await this.userRepository.update({ id: userId }, updateUserDto);

      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!updatedUser) {
        throw new InternalServerErrorException(
          'Error al actualizar el usuario',
        );
      }

      const responseDto = plainToInstance(UpdateUserResponseDto, updatedUser, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });

      return responseDto;
    } catch (error) {
      throw error;
    }
  }
  
  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      if (!payload || !payload.id) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { refreshToken },
        relations: ['user'],
      });
      if (!storedToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (storedToken.expiresAt.getTime() < Date.now()) {
        throw new UnauthorizedException('Refresh token expired');
      }
      await this.refreshTokenRepository.remove(storedToken);
      const newAccessToken = this.getJwtToken({ id: storedToken.user.id });

      const newRefreshToken = this.getRefreshToken({ id: storedToken.user.id });
      const newExpiresAt = add(new Date(), { days: 7 }); // o según tu configuración

      const newTokenEntity = this.refreshTokenRepository.create({
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        user: storedToken.user,
      });
      await this.refreshTokenRepository.save(newTokenEntity);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        switch (error.name) {
          case 'TokenExpiredError':
            throw new UnauthorizedException('Refresh token expired');
          case 'JsonWebTokenError':
            throw new UnauthorizedException('Invalid refresh token');
          default:
            throw new InternalServerErrorException(
              'An unexpected error occurred during token refresh.',
            );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during token refresh.',
      );
    }
  }
}
