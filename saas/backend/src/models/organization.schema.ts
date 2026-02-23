import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Object })
  settings?: Record<string, unknown>;

  @Prop()
  gstin?: string;

  @Prop()
  address?: string;

  @Prop()
  stateCode?: string;

  @Prop()
  businessName?: string;

  @Prop()
  state?: string;

  @Prop()
  logo?: string;

  @Prop()
  watermarkImage?: string;

  @Prop()
  subscriptionPlanId?: string;

  @Prop({ default: 0 })
  productLimit: number;

  @Prop({ default: 0 })
  userLimit: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
