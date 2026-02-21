import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarehouseDocument = Warehouse & Document;

@Schema({ timestamps: true, collection: 'warehouses' })
export class Warehouse {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  address?: string;

  @Prop()
  code?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
