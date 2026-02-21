import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true, collection: 'suppliers' })
export class Supplier {
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
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
