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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo banner mới' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách banners' })
  findAll(@Query('isActive') isActive?: string) {
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    return this.bannersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết banner' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật banner' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
