import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the User',
    required: true,
    example: 'example@gamil.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @ApiProperty({
    description: 'The handle of the User',
    maxLength: 255,
    required: true,
    example: 'example',
  })
  @IsString({ message: 'Handle must be a string' })
  @MaxLength(255, { message: 'Handle must be at most 255 characters' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  handle: string;

  @ApiProperty({
    description: 'The name of the User',
    maxLength: 255,
    required: true,
    example: 'Example Name',
  })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(50, { message: 'Name must be at most 50 characters' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  name: string;

  @ApiProperty({
    description: 'The password of the User',
    maxLength: 255,
    minLength: 8,
    required: true,
    example: 'password123',
  })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(255, { message: 'Password must be at most 255 characters' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  password: string;

  @ApiProperty({
    description: 'The description of the User',
    maxLength: 255,
    example: 'Example Description',
  })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must be at most 255 characters' })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'The image of the User',
    maxLength: 255,
    example: 'https://e.radio-grpp.io/xlarge/2022/07/25/052905_1290151.jpg',
  })
  @IsString({ message: 'Image must be a string' })
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @IsOptional()
  image: string;

  @ApiProperty({
    description: 'The links of the User',
    required: true,
    example: ['https://www.linkedin.com/in/yasser-m-b373117/'],
  })
  @IsString({ each: true, message: 'Links must be strings' })
  @IsOptional()
  links: string[];
}
