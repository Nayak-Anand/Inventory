import { BadRequestException, Body, ConflictException, Get, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  orgSlug?: string;
}

class RegisterDto {
  @IsString()
  @IsNotEmpty()
  orgName: string;

  @IsString()
  @IsNotEmpty()
  orgSlug: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsOptional()
  @IsString()
  orgSlug?: string;
}

class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      mobile: user.mobile,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      orgId: user.orgId,
      roleId: user.roleId,
      roleType: user.roleType || 'company_admin',
      permissions: user.permissions || ['*'],
      assignedCustomerIds: user.assignedCustomerIds || [],
    };
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(@CurrentUser() user: { id: string }, @Body() body: { name?: string; avatar?: string }) {
    return this.authService.updateProfile(user.id, body);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto
  ) {
    try {
      return await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      console.error('[Auth] Change password error:', err?.message || err);
      throw new BadRequestException(err?.message || 'Failed to change password');
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.authService.validateUser(dto.mobile, dto.password, dto.orgSlug);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      return this.authService.login(user);
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      console.error('[Auth] Login error:', err?.message || err);
      throw new BadRequestException(err?.message || 'Login failed');
    }
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (err: any) {
      if (err?.code === 11000) {
        const field = err?.keyPattern?.slug ? 'Org slug' : err?.keyPattern?.mobile ? 'Mobile' : 'Data';
        throw new ConflictException(`${field} already exists. Try a different value.`);
      }
      console.error('[Auth] Register error:', err?.message || err);
      throw new BadRequestException(err?.message || 'Registration failed');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(dto.identifier, dto.orgSlug);
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      console.error('[Auth] Forgot password error:', err?.message || err);
      throw new BadRequestException(err?.message || 'Failed to process forgot password request');
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(dto.resetToken, dto.newPassword);
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      console.error('[Auth] Reset password error:', err?.message || err);
      throw new BadRequestException(err?.message || 'Failed to reset password');
    }
  }
}
