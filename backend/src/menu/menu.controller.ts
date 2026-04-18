import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MenuService } from './menu.service'

@Controller('menu')
@UseGuards(AuthGuard('jwt'))
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get('dishes')
  async getAllDishes() {
    return this.menuService.getAllDishes()
  }

  @Get('categories')
  async getAllCategories() {
    return this.menuService.getAllCategories()
  }
}
