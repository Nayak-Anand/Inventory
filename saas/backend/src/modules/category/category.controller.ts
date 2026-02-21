import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CategoryService } from './category.service';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions('*')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async list(@CurrentOrg() orgId: string) {
    return this.categoryService.findAll(orgId);
  }

  @Post()
  async create(@CurrentOrg() orgId: string, @Body() body: any) {
    const c = await this.categoryService.create(orgId, body);
    return { ...c.toObject(), id: c._id?.toString() };
  }

  @Put(':id')
  async update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() body: any) {
    const c = await this.categoryService.update(orgId, id, body);
    return { ...c.toObject(), id: c._id?.toString() };
  }

  @Delete(':id')
  async delete(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.categoryService.delete(orgId, id);
  }
}
