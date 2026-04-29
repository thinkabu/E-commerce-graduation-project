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
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==========================================
  // Product Endpoints
  // ==========================================

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới (Admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (search, filter, paginate)' })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Lấy sản phẩm nổi bật' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm (theo ID hoặc slug)' })
  @ApiParam({ name: 'idOrSlug', description: 'Product ID hoặc slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findByIdOrSlug(idOrSlug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm - soft delete (Admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // ==========================================
  // Variant Endpoints
  // ==========================================

  @Post(':id/variants')
  @ApiOperation({ summary: 'Thêm biến thể cho sản phẩm (Admin)' })
  createVariant(
    @Param('id') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @Patch(':id/variants/:variantId')
  @ApiOperation({ summary: 'Cập nhật biến thể (Admin)' })
  updateVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(productId, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @ApiOperation({ summary: 'Xóa biến thể - soft delete (Admin)' })
  removeVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.removeVariant(productId, variantId);
  }
}
