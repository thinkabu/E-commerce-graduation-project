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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // TODO: Khi có Auth, lấy userId từ JWT token thay vì query param
  @Post()
  @ApiOperation({ summary: 'Thêm địa chỉ mới' })
  @ApiQuery({ name: 'userId', required: true, description: 'ID user (tạm thời - sẽ lấy từ JWT)' })
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của user' })
  @ApiQuery({ name: 'userId', required: true })
  findAll(@Query('userId') userId: string) {
    return this.addressesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết địa chỉ' })
  @ApiQuery({ name: 'userId', required: true })
  findOne(@Param('id') id: string, @Query('userId') userId: string) {
    return this.addressesService.findById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật địa chỉ' })
  @ApiQuery({ name: 'userId', required: true })
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, dto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Đặt làm địa chỉ mặc định' })
  @ApiQuery({ name: 'userId', required: true })
  setDefault(@Param('id') id: string, @Query('userId') userId: string) {
    return this.addressesService.setDefault(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa địa chỉ (soft delete)' })
  @ApiQuery({ name: 'userId', required: true })
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.addressesService.remove(id, userId);
  }
}
