import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Cho phép cập nhật tất cả các trường bao gồm role, isActive, permissions
export class UpdateUserDto extends PartialType(CreateUserDto) {}
