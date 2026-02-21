import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantService } from './tenant.service';

@Controller('settings')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  async getSettings(@CurrentOrg() orgId: string) {
    return this.tenantService.getSettings(orgId);
  }

  @Put()
  async updateSettings(@CurrentOrg() orgId: string, @Body() body: any) {
    return this.tenantService.updateSettings(orgId, body);
  }
}
