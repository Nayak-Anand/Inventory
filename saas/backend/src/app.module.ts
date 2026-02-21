import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoUri } from './config/db-config';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CategoryModule } from './modules/category/category.module';
import { RoleModule } from './modules/role/role.module';
import { OrderModule } from './modules/order/order.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { TeamModule } from './modules/team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(getMongoUri()),
    CloudinaryModule,
    TenantModule,
    AuthModule,
    InventoryModule,
    WarehouseModule,
    SalesModule,
    SupplierModule,
    CategoryModule,
    RoleModule,
    OrderModule,
    SubscriptionModule,
    TeamModule,
  ],
})
export class AppModule {}
