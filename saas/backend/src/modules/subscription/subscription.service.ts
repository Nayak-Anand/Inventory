import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from '../../models/subscription-plan.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private planModel: Model<SubscriptionPlanDocument>,
  ) {}

  async findAll() {
    const list = await this.planModel.find({ isActive: true }).lean().exec();
    return list.map((p: any) => ({ ...p, id: p._id?.toString() }));
  }

  async create(data: Partial<SubscriptionPlan>) {
    const p = new this.planModel(data);
    return p.save();
  }

  async seedDefault() {
    const count = await this.planModel.countDocuments().exec();
    if (count > 0) return;
    await this.planModel.insertMany([
      { name: 'Starter', slug: 'starter', productLimit: 100, userLimit: 3, storageLimitMB: 100, priceMonthly: 0 },
      { name: 'Growth', slug: 'growth', productLimit: 500, userLimit: 10, storageLimitMB: 500, priceMonthly: 999 },
      { name: 'Enterprise', slug: 'enterprise', productLimit: 0, userLimit: 0, storageLimitMB: 0, priceMonthly: 4999 },
    ]);
  }
}
