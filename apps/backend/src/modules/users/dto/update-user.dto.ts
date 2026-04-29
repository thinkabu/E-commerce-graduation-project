import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Không cho cập nhật email, password, role qua endpoint này
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password', 'role'] as const),
) {}
