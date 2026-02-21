import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { InventoryService } from './inventory.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  initialStock?: number;
}

class UpdateItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  reorderLevel?: number;
}

@Controller('items')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async create(@CurrentOrg() orgId: string, @Body() dto: CreateItemDto) {
    const warehouses = await this.warehouseService.findAll(orgId);
    const defaultWhId = warehouses[0]?.id;
    const item = await this.inventoryService.createItem(orgId, dto);
    const itemId = item._id?.toString();
    if (defaultWhId && (dto.initialStock ?? 0) > 0) {
      await this.inventoryService.addStock(orgId, defaultWhId, itemId, dto.initialStock ?? 0, 'in', 'opening', itemId);
    }
    return { ...item.toObject(), id: itemId };
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateItemDto) {
    const item = await this.inventoryService.getItemModel().findOne({ _id: id, orgId }).exec();
    if (!item) return null;
    Object.assign(item, dto);
    await item.save();
    return { ...item.toObject(), id: item._id?.toString() };
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async delete(@CurrentOrg() orgId: string, @Param('id') id: string) {
    await this.inventoryService.getItemModel().deleteOne({ _id: id, orgId }).exec();
    return { success: true };
  }

  @Post(':id/stock')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async addStock(
    @CurrentOrg() orgId: string,
    @Param('id') itemId: string,
    @Body() body: { quantity: number; warehouseId?: string },
  ) {
    const warehouses = await this.warehouseService.findAll(orgId);
    const whId = body.warehouseId || warehouses[0]?.id;
    if (!whId) return { success: false };
    await this.inventoryService.addStock(orgId, whId, itemId, body.quantity || 0, 'in', 'manual');
    return { success: true };
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('stock.view', 'catalog.view', '*')
  async list(
    @CurrentOrg() orgId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    const filter: any = { orgId };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
      ];
    }
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const [raw, total] = await Promise.all([
      this.inventoryService.getItemModel().find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean().exec(),
      this.inventoryService.getItemModel().countDocuments(filter).exec(),
    ]);
    const warehouses = await this.warehouseService.findAll(orgId);
    const defaultWhId = warehouses[0]?.id;
    const data = await Promise.all(
      raw.map(async (r: any) => {
        const id = r._id?.toString();
        let stock = 0;
        if (defaultWhId) stock = await this.inventoryService.getStock(orgId, defaultWhId, id);
        return { ...r, id, stock };
      }),
    );
    return { data, total, page: p, limit: l };
  }

  @Get(':id/stock')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('stock.view', 'catalog.view', '*')
  async getStock(
    @CurrentOrg() orgId: string,
    @Param('id') itemId: string,
    @Query('warehouseId') warehouseId: string,
  ) {
    if (!warehouseId) return { quantity: 0 };
    const qty = await this.inventoryService.getStock(orgId, warehouseId, itemId);
    return { quantity: qty };
  }
}
