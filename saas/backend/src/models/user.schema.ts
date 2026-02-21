import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  orgId: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatar?: string;

  @Prop()
  roleId?: string;

  @Prop({ type: [String], default: [] })
  assignedCustomerIds: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ select: false })
  resetToken?: string;

  @Prop({ select: false })
  resetTokenExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ orgId: 1, mobile: 1 }, { unique: true });
