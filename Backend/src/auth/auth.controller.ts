import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponseWithData } from 'src/common/decorators/api-response-with-data.decorator';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { GetUserHandleResponseDto } from './dto/get-user-handle-response.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { SearchUserHandleResponseDto } from './dto/search-user-handle-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponseWithData(
    null,
    'Refresh token is invalid or expired',
    HttpStatus.OK,
  )
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponseDto<RefreshTokenResponseDto>> {
    const { refreshToken } = refreshTokenDto;
    const token = await this.authService.refreshToken(refreshToken);
    const refreshTokenResponse: RefreshTokenResponseDto = {
      refreshToken: token.refreshToken,
    };
    return ApiResponseDto.Success(
      refreshTokenResponse,
      'Token Refreshed',
      'Token Refreshed',
    );
  }

  @ApiOperation({ summary: 'User register' })
  @ApiResponseWithData(
    CreateUserResponseDto,
    'User Create succesfully',
    HttpStatus.CREATED,
  )
  @ApiResponseWithData(null, 'User not created', HttpStatus.BAD_REQUEST)
  @Post('register')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponseDto<CreateUserResponseDto>> {
    const user = await this.authService.create(createUserDto);
    return ApiResponseDto.Success(
      user,
      'User created successfully',
      'User completed registration',
    );
  }

  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponseWithData(
    LoginUserResponseDto,
    'Your are logged in',
    HttpStatus.OK,
  )
  @ApiResponseWithData(
    null,
    'Invalid MLS ID. Please ensure your license is active and correct..',
    HttpStatus.BAD_REQUEST,
  )
  @Public()
  @HttpCode(200)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<ApiResponseDto<LoginUserResponseDto>> {
    const result = await this.authService.login(loginUserDto);
    return ApiResponseDto.Success(result, 'User Login', 'Your are logged in');
  }

  @ApiOperation({ summary: 'update user' })
  @ApiResponseWithData(UpdateUserResponseDto, 'User updated', HttpStatus.OK)
  @ApiResponseWithData(
    null,
    'Invalid user. Please ensure your user is active and correct..',
    HttpStatus.BAD_REQUEST,
  )
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseDto<UpdateUserResponseDto>> {
    const user = await this.authService.updateProfile(id, updateUserDto);
    return ApiResponseDto.Success(user, 'User updated', 'User updated');
  }

  @ApiOperation({ summary: 'get user bye handle' })
  @ApiResponseWithData(
    GetUserHandleResponseDto,
    'Your are logged in',
    HttpStatus.OK,
  )
  @ApiResponseWithData(
    null,
    'Invalid user. Please ensure your user is active and correct..',
    HttpStatus.BAD_REQUEST,
  )
  @Public()
  @Get('handle/:handle')
  async getUserByHandle(
    @Param('handle') handle: string,
  ): Promise<ApiResponseDto<GetUserHandleResponseDto>> {
    const user = await this.authService.getUserByHandle(handle);
    return ApiResponseDto.Success(user, 'Handle ocupado', 'User found');
  }

  @ApiOperation({ summary: 'search user by handle' })
  @ApiResponseWithData(
    SearchUserHandleResponseDto,
    'Usuario Disponible',
    HttpStatus.OK,
  )
  @ApiResponseWithData(
    null,
    'Usuario ya registrado',
    HttpStatus.BAD_REQUEST,
  )
  @Public()
  @Get('search/:handle')
  async searchUserByHandle(@Param('handle') handle: string)
  :Promise<ApiResponseDto<SearchUserHandleResponseDto>> {
    const user = await this.authService.searchUserByHandle(handle);
    return ApiResponseDto.Success(user, `${handle} disponible`, `${handle} disponible`);
  }

  @ApiOperation({ summary: 'get user' })
  @ApiResponseWithData(
    CreateUserResponseDto,
    'Your are logged in',
    HttpStatus.OK,
  )
  @ApiResponseWithData(
    null,
    'Invalid user. Please ensure your user is active and correct..',
    HttpStatus.BAD_REQUEST,
  )
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt-access'))
  @Get(':id')
  async getUser(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<CreateUserResponseDto>> {
    const user = await this.authService.getUser(id);
    return ApiResponseDto.Success(user, 'User found', 'User found');
  }
}
