import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
