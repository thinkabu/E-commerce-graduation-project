import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignsService, CreateCampaignDto } from './campaigns.service';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Admin tạo và gửi campaign push notification' })
  create(@Body() dto: CreateCampaignDto, @Query('adminId') adminId: string) {
    return this.campaignsService.create(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách campaigns (Admin)' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.campaignsService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết campaign' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }
}
