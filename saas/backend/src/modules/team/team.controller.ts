import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TeamService } from './team.service';

@Controller('team-members')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get()
  async list(@CurrentOrg() orgId: string) {
    return this.teamService.list(orgId);
  }

  @Get('sales-performance')
  async salesPerformance(
    @CurrentOrg() orgId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.teamService.salesmanPerformance(orgId, fromDate, toDate);
  }

  @Get('sales-performance/:salesmanId')
  async salesmanDetails(
    @CurrentOrg() orgId: string,
    @Param('salesmanId') salesmanId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.teamService.salesmanDetails(orgId, salesmanId, fromDate, toDate);
  }

  @Post()
  async create(
    @CurrentOrg() orgId: string,
    @Body()
    body: {
      name: string;
      mobile: string;
      email?: string;
      password: string;
      roleType: 'salesman' | 'b2b_customer';
      assignedCustomerIds?: string[];
      avatar?: string;
    },
  ) {
    return this.teamService.create(orgId, body);
  }

  @Put(':id')
  async update(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      mobile: string;
      email?: string;
      roleType: 'salesman' | 'b2b_customer';
      assignedCustomerIds: string[];
      avatar?: string;
    }>,
  ) {
    return this.teamService.update(orgId, id, body);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.teamService.resetPassword(orgId, id, body.newPassword);
  }

  @Delete(':id')
  async remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.teamService.softDelete(orgId, id);
  }
}

