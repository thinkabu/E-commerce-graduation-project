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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // TODO: Khi có Auth, lấy userId từ JWT token thay vì query param
  @Get()
  @ApiOperation({ summary: 'Lấy giỏ hàng (populate product info)' })
  @ApiQuery({ name: 'userId', required: true, description: 'Tạm thời - sẽ lấy từ JWT' })
  getCart(@Query('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ hàng' })
  @ApiQuery({ name: 'userId', required: true })
  addItem(@Query('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ' })
  @ApiQuery({ name: 'userId', required: true })
  updateItem(
    @Query('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiQuery({ name: 'userId', required: true })
  removeItem(
    @Query('userId') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Xóa toàn bộ giỏ hàng' })
  @ApiQuery({ name: 'userId', required: true })
  clearCart(@Query('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
