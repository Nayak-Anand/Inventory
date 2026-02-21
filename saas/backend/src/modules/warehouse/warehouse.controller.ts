import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { WarehouseService } from './warehouse.service';

@Controller('warehouses')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Post()
  async create(
    @CurrentOrg() orgId: string,
    @Body() body: { name: string; address?: string; code?: string },
  ) {
    return this.warehouseService.create(orgId, body);
  }

  @Get()
  async list(@CurrentOrg() orgId: string) {
    return this.warehouseService.findAll(orgId);
  }
}
