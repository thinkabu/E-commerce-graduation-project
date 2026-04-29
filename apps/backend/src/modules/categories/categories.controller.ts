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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả danh mục' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query('isActive') isActive?: boolean) {
    return this.categoriesService.findAll({ isActive });
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy danh mục dạng cây phân cấp' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục (soft delete)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
