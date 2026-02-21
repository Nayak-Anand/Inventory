import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true, collection: 'items' })
export class Item {
  @Prop({ required: true })
  orgId: string;

  @Prop({ default: 'simple' })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sku: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 18 })
  gstRate: number;

  @Prop()
  hsnCode?: string;

  @Prop({ default: 0 })
  reorderLevel: number;

  @Prop()
  categoryId?: string;

  @Prop({ type: Object, default: {} })
  priceTiers?: Record<string, number>;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Object })
  attributes?: Record<string, unknown>;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.index({ orgId: 1, sku: 1 }, { unique: true });
