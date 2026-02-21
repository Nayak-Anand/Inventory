import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RoleService } from './role.service';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  async list(@CurrentOrg() orgId: string) {
    return this.roleService.findAll(orgId);
  }

  @Post('seed')
  async seed(@CurrentOrg() orgId: string) {
    await this.roleService.seedDefaultRoles(orgId);
    return { success: true };
  }

  @Post()
  async create(@CurrentOrg() orgId: string, @Body() body: any) {
    const r = await this.roleService.create(orgId, body);
    return { ...r.toObject(), id: r._id?.toString() };
  }
}
