import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../models/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(orgId: string, data: Partial<Category>) {
    const c = new this.categoryModel({ ...data, orgId });
    return c.save();
  }

  async findAll(orgId: string) {
    const list = await this.categoryModel
      .find({ orgId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();
    return list.map((c: any) => ({ ...c, id: c._id?.toString() }));
  }

  async update(orgId: string, id: string, data: Partial<Category>) {
    const c = await this.categoryModel.findOne({ _id: id, orgId }).exec();
    if (!c) throw new BadRequestException('Category not found');
    Object.assign(c, data);
    return c.save();
  }

  async delete(orgId: string, id: string) {
    await this.categoryModel.updateOne(
      { _id: id, orgId },
      { $set: { isActive: false } },
    ).exec();
    return { success: true };
  }
}
