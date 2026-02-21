import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  gstin?: string;

  @Prop()
  placeOfSupply?: string;

  @Prop()
  stateCode?: string;

  @Prop({ default: 0 })
  creditLimit: number;

  @Prop()
  userId?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
