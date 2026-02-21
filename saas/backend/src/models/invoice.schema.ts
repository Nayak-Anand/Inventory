import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

const InvoiceLineSchema = new MongooseSchema(
  {
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
  },
  { _id: true },
);

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  date: Date;

  @Prop()
  dueDate?: Date;

  @Prop({ default: 'draft' })
  status: string;

  @Prop({ default: 'pending' })
  paymentStatus: string;

  @Prop()
  paymentReceivedAt?: Date;

  @Prop()
  markedByUserId?: string;

  @Prop()
  markedByName?: string;

  @Prop({ default: 'cgst_sgst' })
  gstType: string;

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  cgst: number;

  @Prop({ default: 0 })
  sgst: number;

  @Prop({ default: 0 })
  igst: number;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ type: [InvoiceLineSchema], default: [] })
  lines: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit?: string;
    rate: number;
    amount: number;
    taxAmount?: number;
  }>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
