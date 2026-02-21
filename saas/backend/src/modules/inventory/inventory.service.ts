import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../../models/item.schema';
import { InventoryLedger, InventoryLedgerDocument } from '../../models/inventory-ledger.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Item.name)
    private itemModel: Model<ItemDocument>,
    @InjectModel(InventoryLedger.name)
    private ledgerModel: Model<InventoryLedgerDocument>,
  ) {}

  async createItem(orgId: string, data: Partial<Item>) {
    const sku = data.sku || (await this.generateSku(orgId, data.name || ''));
    const item = new this.itemModel({ ...data, orgId, sku });
    return item.save();
  }

  async generateSku(orgId: string, name: string): Promise<string> {
    const count = await this.itemModel.countDocuments({ orgId });
    const prefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '') || 'ITM';
    return `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }

  getItemModel(): Model<ItemDocument> {
    return this.itemModel;
  }

  async getItem(orgId: string, itemId: string): Promise<{ gstRate?: number } | null> {
    return this.itemModel.findOne({ _id: itemId, orgId }).select('gstRate').lean().exec();
  }

  async getStock(orgId: string, warehouseId: string, itemId: string): Promise<number> {
    const result = await this.ledgerModel.aggregate([
      { $match: { orgId, warehouseId, itemId } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    return result[0]?.total || 0;
  }

  async addStock(
    orgId: string,
    warehouseId: string,
    itemId: string,
    quantity: number,
    type: string,
    refType?: string,
    refId?: string,
  ) {
    await this.ledgerModel.create({
      orgId,
      warehouseId,
      itemId,
      quantity,
      type,
      refType,
      refId,
    });
  }

  async reduceStock(
    orgId: string,
    warehouseId: string,
    itemId: string,
    quantity: number,
    refType?: string,
    refId?: string,
  ) {
    const current = await this.getStock(orgId, warehouseId, itemId);
    if (current < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${current}`);
    }
    await this.ledgerModel.create({
      orgId,
      warehouseId,
      itemId,
      quantity: -quantity,
      type: 'out',
      refType,
      refId,
    });
  }
}
