import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

const OrderLineSchema = new MongooseSchema({
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  gstRate: { type: Number, default: 18 },
});

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  customerId: string;

  @Prop()
  salesmanId?: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 'pending' })
  approvalStatus: string;

  @Prop()
  approvedBy?: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ type: [OrderLineSchema], default: [] })
  lines: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit?: string;
    rate: number;
    amount: number;
    gstRate?: number;
  }>;

  @Prop()
  invoiceId?: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ orgId: 1, orderNumber: 1 });
