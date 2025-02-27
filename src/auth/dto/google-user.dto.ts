import { ApiProperty } from '@nestjs/swagger';

export class GoogleUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({ example: 'Alex', description: 'User name' })
  firstName: string;

  @ApiProperty({ example: 'Bes', description: 'User surname' })
  lastName: string;

  @ApiProperty({
    example: 'https://avatar.com/test.png',
    description: 'User photo',
  })
  picture: string;
}
