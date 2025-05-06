import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'The email of the User',
    required: true,
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'The handle of the User',
    maxLength: 255,
    required: true,
    example: 'example',
  })
  @Expose()
  handle: string;

  @ApiProperty({
    description: 'The name of the User',
    maxLength: 255,
    required: true,
    example: 'Example Name',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'The password of the User',
    maxLength: 255,
    minLength: 8,
    required: true,
    example: 'Password123',
  })
  @Expose()
  password: string;

  @ApiProperty({
    description: 'The description of the User',
    maxLength: 255,
    example: 'Example Description',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'The image of the User',
    maxLength: 255,
    example: 'https://e.radio-grpp.io/xlarge/2022/07/25/052905_1290151.jpg',
  })
  @Expose()
  image: string;

  @ApiProperty({
    description: 'The links of the User',
    required: true,
    example: ['https://www.linkedin.com/in/yasser-m-b373117/'],
  })
  @Expose()
  links: { name: string; url: string; enabled: boolean; id: number }[];
}
