import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('orders.view', '*')
  async list(@CurrentOrg() orgId: string, @CurrentUser() user: any) {
    return this.orderService.list(orgId, user);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('orders.create', 'orders.place', '*')
  async create(@CurrentOrg() orgId: string, @Body() body: any, @CurrentUser() user: any) {
    return this.orderService.create(orgId, body, user);
  }

  @Post(':id/approve')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async approve(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() body: { applyGst?: boolean; setDueDate?: boolean; dueDate?: string }, @CurrentUser() user: any) {
    const applyGst = body?.applyGst !== false;
    const setDueDate = body?.setDueDate !== false;
    const dueDate = body?.dueDate;
    return this.orderService.approve(orgId, id, user?.id || user?.sub || '', applyGst, setDueDate, dueDate);
  }

  @Post(':id/reject')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async reject(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.orderService.reject(orgId, id);
  }
}
