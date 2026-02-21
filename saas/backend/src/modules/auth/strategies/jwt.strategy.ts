import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../models/user.schema';
import { Role, RoleDocument } from '../../../models/role.schema';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET') || 'inventory-saas-secret-change-in-prod',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user || !user.isActive) throw new UnauthorizedException();
    
    // Migrate old users: if no mobile, use email
    if (!user.mobile && user.email) {
      user.mobile = user.email;
      await user.save();
    }
    
    let roleType = '';
    let permissions: string[] = [];
    if (user.roleId) {
      const role = await this.roleModel.findById(user.roleId).lean().exec();
      if (role) {
        roleType = (role as any).roleType || '';
        permissions = (role as any).permissions || [];
      }
    }
    return {
      sub: payload.sub,
      id: payload.sub,
      mobile: user.mobile || payload.mobile || user.email || '',
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      orgId: payload.orgId,
      roleId: payload.roleId,
      roleType,
      permissions,
      assignedCustomerIds: user.assignedCustomerIds || [],
    };
  }
}
