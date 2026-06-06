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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã giảm giá mới' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mã giảm giá' })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const query: any = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.search = search;
    return this.couponsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết mã giảm giá' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra mã giảm giá hợp lệ' })
  validate(@Body() body: { code: string; orderAmount: number }) {
    return this.couponsService.validate(body.code, body.orderAmount);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật mã giảm giá' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mã giảm giá' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
