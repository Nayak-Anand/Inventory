import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
  async seed() {
    await this.subscriptionService.seedDefault();
    return { success: true };
  }

  @Post()
  async create(@Body() body: any) {
    const p = await this.subscriptionService.create(body);
    return { ...p.toObject(), id: p._id?.toString() };
  }
}
