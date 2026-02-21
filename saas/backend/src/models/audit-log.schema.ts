import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop()
  orgId?: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  action: string;

  @Prop()
  entityType?: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  oldData?: Record<string, unknown>;

  @Prop({ type: Object })
  newData?: Record<string, unknown>;

  @Prop()
  ip?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ orgId: 1, createdAt: -1 });
