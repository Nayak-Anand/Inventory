import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription-plans')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  async list() {
    return this.subscriptionService.findAll();
  }

  @Post('seed')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async seed() {
    await this.subscriptionService.seedDefault();
    return { success: true };
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('*')
  async create(@Body() body: any) {
    const p = await this.subscriptionService.create(body);
    return { ...p.toObject(), id: p._id?.toString() };
  }
}
