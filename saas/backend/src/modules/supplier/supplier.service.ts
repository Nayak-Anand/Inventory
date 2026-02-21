import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from '../../models/supplier.schema';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(orgId: string, data: Partial<Supplier>) {
    const s = new this.supplierModel({ ...data, orgId });
    return s.save();
  }

  async findAll(orgId: string) {
    const list = await this.supplierModel.find({ orgId }).sort({ name: 1 }).lean().exec();
    return list.map((s: any) => ({ ...s, id: s._id?.toString() }));
  }

  async update(orgId: string, id: string, data: Partial<Supplier>) {
    const s = await this.supplierModel.findOne({ _id: id, orgId }).exec();
    if (!s) throw new BadRequestException('Supplier not found');
    Object.assign(s, data);
    return s.save();
  }

  async delete(orgId: string, id: string) {
    await this.supplierModel.deleteOne({ _id: id, orgId }).exec();
    return { success: true };
  }
}
