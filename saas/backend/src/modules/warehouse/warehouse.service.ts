import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Warehouse, WarehouseDocument } from '../../models/warehouse.schema';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectModel(Warehouse.name)
    private warehouseModel: Model<WarehouseDocument>,
  ) {}

  async create(orgId: string, data: Partial<Warehouse>) {
    const wh = new this.warehouseModel({ ...data, orgId });
    return wh.save();
  }

  async findAll(orgId: string) {
    const list = await this.warehouseModel.find({ orgId }).sort({ name: 1 }).lean().exec();
    return list.map((w: any) => ({ ...w, id: w._id?.toString() }));
  }
}
