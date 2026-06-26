import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVnPayDto {
  @ApiProperty({ example: '65f123456789abcdef012345' })
  @IsString()
  orderId: string;
}
