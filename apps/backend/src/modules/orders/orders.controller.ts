import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../../common/enums';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiQuery({ name: 'userId', required: true })
  create(@Query('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  // --- ADMIN ENDPOINTS ---

  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Lấy dữ liệu tổng hợp Dashboard (Admin)' })
  getAdminDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getAdminDashboardStats(startDate, endDate);
  }

  @Get('admin/summary')
  @ApiOperation({ summary: 'Lấy thống kê đơn hàng (Admin)' })
  getAdminOrderSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getAdminOrderSummary(startDate, endDate);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn hàng (Admin)' })
  findAllForAdmin(@Query() query: any) {
    return this.ordersService.findAllForAdmin(query);
  }

  @Patch('admin/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (Admin)' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('adminId') adminId?: string,
    @Body('note') note?: string,
  ) {
    return this.ordersService.updateOrderStatus(id, status, adminId, note);
  }

  // --- USER ENDPOINTS ---

  @Get('user')
  @ApiOperation({ summary: 'Lấy lịch sử đơn hàng của user hiện tại' })
  @ApiQuery({ name: 'userId', required: true })
  findUserOrders(@Query('userId') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiQuery({ name: 'userId', required: true })
  findOne(@Query('userId') userId: string, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, userId);
  }
}
