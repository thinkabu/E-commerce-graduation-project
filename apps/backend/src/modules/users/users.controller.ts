import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo user mới (Admin)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách users (paginated)' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  // TODO: Cần Auth guard - lấy userId từ JWT token
  // @Get('profile')
  // @ApiOperation({ summary: 'Lấy profile user hiện tại' })
  // getProfile(@Req() req) {
  //   return this.usersService.findById(req.user.id);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết user' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // TODO: Endpoint PATCH /profile cần Auth guard
  // @Patch('profile')
  // @ApiOperation({ summary: 'Cập nhật profile user hiện tại' })
  // updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
  //   return this.usersService.update(req.user.id, dto);
  // }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật user (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user - soft delete (Admin)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
