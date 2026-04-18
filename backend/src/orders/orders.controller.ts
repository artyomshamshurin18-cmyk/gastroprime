import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { OrdersService } from './orders.service'

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async getMyOrders(@Request() req) {
    return this.ordersService.getOrdersByUser(req.user.userId)
  }

  @Post()
  async createOrder(@Request() req, @Body() body: any) {
    return this.ordersService.createOrder(req.user.userId, body)
  }
}
