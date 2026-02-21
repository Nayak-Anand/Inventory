import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

@Schema({ timestamps: true, collection: 'subscription_plans' })
export class SubscriptionPlan {
  @Prop({ required: true })
  name: string;

  @Prop()
  slug?: string;

  @Prop({ default: 0 })
  productLimit: number;

  @Prop({ default: 0 })
  userLimit: number;

  @Prop({ default: 0 })
  storageLimitMB: number;

  @Prop({ default: 0 })
  priceMonthly: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlan);
