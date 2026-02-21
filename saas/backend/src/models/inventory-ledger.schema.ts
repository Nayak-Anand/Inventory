import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryLedgerDocument = InventoryLedger & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'inventory_ledger' })
export class InventoryLedger {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  warehouseId: string;

  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  type: string;

  @Prop()
  refType?: string;

  @Prop()
  refId?: string;

  @Prop()
  notes?: string;

  @Prop()
  batchNumber?: string;

  @Prop()
  expiryDate?: Date;
}

export const InventoryLedgerSchema = SchemaFactory.createForClass(InventoryLedger);
