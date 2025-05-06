import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The handle of the User',
    maxLength: 255,
    required: true,
    example: 'example',
  })
  @IsString({ message: 'Handle must be a string' })
  @MaxLength(255, { message: 'Handle must be at most 255 characters' })
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsOptional()
  handle: string;

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
    description: 'The links of the User',
    required: true,
    example: ['https://www.linkedin.com/in/yasser-m-b373117/'],
  })
  @IsOptional()
  links: { name: string; url: string; enabled: boolean; id: number }[];
}
