import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../models/user.schema';
import { Role, RoleDocument } from '../../models/role.schema';
import { TenantService } from '../tenant/tenant.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { RoleService } from '../role/role.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface JwtPayload {
  sub: string;
  mobile: string;
  orgId: string;
  roleId: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: { id: string; mobile: string; email?: string; name: string; avatar?: string; orgId: string; roleType?: string; permissions?: string[]; assignedCustomerIds?: string[] };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
    private tenantService: TenantService,
    private warehouseService: WarehouseService,
    private roleService: RoleService,
    private cloudinary: CloudinaryService,
  ) {}

  async validateUser(identifier: string, password: string, orgSlug?: string): Promise<UserDocument | null> {
    let user: UserDocument | null;
    const org = orgSlug ? await this.tenantService.findBySlug(orgSlug) : null;
    const orgId = org ? org._id.toString() : null;
    
    // Try mobile first (new way)
    if (orgId) {
      user = await this.userModel.findOne({ mobile: identifier, orgId }).select('+passwordHash').exec();
    } else {
      user = await this.userModel.findOne({ mobile: identifier }).select('+passwordHash').exec();
    }
    
    // If not found, try email (backward compatibility for old accounts)
    if (!user) {
      if (orgId) {
        user = await this.userModel.findOne({ email: identifier, orgId }).select('+passwordHash').exec();
      } else {
        user = await this.userModel.findOne({ email: identifier }).select('+passwordHash').exec();
      }
    }
    
    if (!user || !user.isActive || !user.passwordHash) return null;
    
    // If user doesn't have mobile but has email, migrate it
    if (!user.mobile && user.email) {
      user.mobile = user.email; // Use email as mobile temporarily
      await user.save();
    }
    
    try {
      const valid = bcrypt.compareSync(password, user.passwordHash);
      return valid ? user : null;
    } catch {
      return null;
    }
  }

  async login(user: UserDocument): Promise<LoginResponse> {
    // Ensure mobile exists (for backward compatibility)
    if (!user.mobile && user.email) {
      user.mobile = user.email;
      await user.save();
    }
    
    const payload: JwtPayload = {
      sub: user._id.toString(),
      mobile: user.mobile || user.email || '',
      orgId: user.orgId,
      roleId: user.roleId || '',
    };
    const accessToken = this.jwtService.sign(payload);
    const decoded = this.jwtService.decode(accessToken) as { exp: number };
    let roleType = 'company_admin';
    let permissions: string[] = ['*'];
    if (user.roleId) {
      const role = await this.roleModel.findById(user.roleId).lean().exec();
      if (role) {
        roleType = (role as any).roleType || roleType;
        permissions = (role as any).permissions || permissions;
      }
    }
    return {
      accessToken,
      expiresIn: decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900,
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        orgId: user.orgId,
        roleType,
        permissions,
        assignedCustomerIds: user.assignedCustomerIds || [],
      },
    };
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.isActive) throw new UnauthorizedException();
    if (data.name !== undefined) user.name = data.name;
    if (data.avatar !== undefined) {
      const avatarData = data.avatar;
      if (avatarData.startsWith('data:image/') && this.cloudinary.isConfigured()) {
        try {
          user.avatar = await this.cloudinary.uploadImage(avatarData);
        } catch {
          user.avatar = avatarData;
        }
      } else {
        user.avatar = avatarData;
      }
    }
    await user.save();
    return { id: user._id.toString(), mobile: user.mobile, email: user.email, name: user.name, avatar: user.avatar, orgId: user.orgId, roleId: user.roleId };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId).select('+passwordHash').exec();
    if (!user || !user.isActive || !user.passwordHash) throw new UnauthorizedException('User not found');
    
    const isValidPassword = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isValidPassword) throw new UnauthorizedException('Current password is incorrect');
    
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  async register(data: {
    orgName: string;
    orgSlug: string;
    mobile: string;
    password: string;
    name: string;
    email?: string;
  }) {
    const org = await this.tenantService.createOrganization({
      name: data.orgName,
      slug: data.orgSlug,
      businessName: data.orgName,
    });
    try {
      await this.warehouseService.create(org._id.toString(), {
        name: 'Main Warehouse',
        code: 'MAIN',
      });
    } catch {
      // Continue - user can create warehouse later
    }
    const companyAdminRole = await this.roleService.getCompanyAdminRole(org._id.toString());
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const user = new this.userModel({
      orgId: org._id.toString(),
      mobile: data.mobile,
      email: data.email,
      passwordHash,
      name: data.name,
      roleId: companyAdminRole?._id?.toString(),
    });
    await user.save();
    return this.login(user as UserDocument);
  }

  async forgotPassword(identifier: string, orgSlug?: string) {
    let user: UserDocument | null;
    const org = orgSlug ? await this.tenantService.findBySlug(orgSlug) : null;
    const orgId = org ? org._id.toString() : null;
    
    // Try mobile first
    if (orgId) {
      user = await this.userModel.findOne({ mobile: identifier, orgId }).exec();
    } else {
      user = await this.userModel.findOne({ mobile: identifier }).exec();
    }
    
    // If not found, try email
    if (!user) {
      if (orgId) {
        user = await this.userModel.findOne({ email: identifier, orgId }).exec();
      } else {
        user = await this.userModel.findOne({ email: identifier }).exec();
      }
    }
    
    if (!user || !user.isActive) {
      // Don't reveal if user exists or not (security best practice)
      return { message: 'If a company admin account exists with this mobile/email, a reset token has been generated.' };
    }
    
    // Check if user is company_admin (not team member)
    let roleType = 'company_admin';
    if (user.roleId) {
      const role = await this.roleModel.findById(user.roleId).lean().exec();
      if (role) {
        roleType = (role as any).roleType || roleType;
      }
    }
    
    // Only allow password reset for company_admin
    if (roleType !== 'company_admin') {
      throw new UnauthorizedException('Password reset is only available for company admin accounts. Please contact your administrator.');
    }
    
    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Valid for 1 hour
    
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    
    // In production, send via email/SMS. For now, return token (admin can share it)
    return { 
      message: 'Reset token generated successfully.',
      resetToken, // Remove this in production, send via email/SMS instead
      expiresIn: '1 hour'
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const user = await this.userModel.findOne({ 
      resetToken,
      resetTokenExpiry: { $gt: new Date() }
    }).select('+passwordHash').exec();
    
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    
    // Check if user is company_admin (not team member)
    let roleType = 'company_admin';
    if (user.roleId) {
      const role = await this.roleModel.findById(user.roleId).lean().exec();
      if (role) {
        roleType = (role as any).roleType || roleType;
      }
    }
    
    // Only allow password reset for company_admin
    if (roleType !== 'company_admin') {
      throw new UnauthorizedException('Password reset is only available for company admin accounts.');
    }
    
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    
    return { message: 'Password reset successfully' };
  }
}
