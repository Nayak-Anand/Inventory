import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SupplierService } from './supplier.service';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  async list(@CurrentOrg() orgId: string) {
    return this.supplierService.findAll(orgId);
  }

  @Post()
  async create(@CurrentOrg() orgId: string, @Body() body: any) {
    const s = await this.supplierService.create(orgId, body);
    return { ...s.toObject(), id: s._id?.toString() };
  }

  @Put(':id')
  async update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    const s = await this.supplierService.update(orgId, id, body);
    return { ...s.toObject(), id: s._id?.toString() };
  }

  @Delete(':id')
  async delete(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.supplierService.delete(orgId, id);
  }
}
