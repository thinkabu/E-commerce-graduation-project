import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // TODO: Khi có Auth, lấy userId từ JWT token thay vì query param
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu thích (paginated)' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.wishlistService.findAllByUser(userId, page, limit);
  }

  @Post('toggle/:productId')
  @ApiOperation({ summary: 'Toggle yêu thích (thêm/xóa)' })
  @ApiQuery({ name: 'userId', required: true })
  toggle(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggle(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Kiểm tra sản phẩm đã wishlist chưa' })
  @ApiQuery({ name: 'userId', required: true })
  check(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.checkProduct(userId, productId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khỏi wishlist' })
  @ApiQuery({ name: 'userId', required: true })
  remove(@Query('userId') userId: string, @Param('id') id: string) {
    return this.wishlistService.remove(userId, id);
  }
}
