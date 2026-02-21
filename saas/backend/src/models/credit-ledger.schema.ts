import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditLedgerDocument = CreditLedger & Document;

@Schema({ timestamps: true, collection: 'credit_ledger' })
export class CreditLedger {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop()
  refType?: string;

  @Prop()
  refId?: string;

  @Prop()
  description?: string;

  @Prop()
  createdBy?: string;
}

export const CreditLedgerSchema = SchemaFactory.createForClass(CreditLedger);
CreditLedgerSchema.index({ orgId: 1, customerId: 1 });
