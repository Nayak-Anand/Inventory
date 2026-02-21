import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post('customers')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('customers.create', '*')
  async createCustomer(@CurrentOrg() orgId: string, @Body() body: any): Promise<any> {
    return this.salesService.createCustomer(orgId, body);
  }

  @Get('customers')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('customers.view', '*')
  async listCustomers(@CurrentOrg() orgId: string, @CurrentUser() user: any) {
    return this.salesService.listCustomers(orgId, user);
  }

  @Put('customers/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('customers.update', '*')
  async updateCustomer(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() body: any): Promise<any> {
    return this.salesService.updateCustomer(orgId, id, body);
  }

  @Delete('customers/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async deleteCustomer(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.salesService.deleteCustomer(orgId, id);
  }

  @Post('invoices')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async createInvoice(@CurrentOrg() orgId: string, @Body() body: any): Promise<any> {
    return this.salesService.createInvoice(orgId, body.warehouseId, body);
  }

  @Get('invoices')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('orders.view', 'invoice.download', 'outstanding.view', '*')
  async listInvoices(@CurrentOrg() orgId: string, @CurrentUser() user: any) {
    return this.salesService.listInvoices(orgId, user);
  }

  @Put('invoices/:id/paid')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('payments.entry', '*')
  async markPaid(@CurrentOrg() orgId: string, @Param('id') invoiceId: string, @CurrentUser() user: any) {
    return this.salesService.markInvoicePaid(orgId, invoiceId, user);
  }
}
