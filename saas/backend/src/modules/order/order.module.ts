import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../../models/order.schema';
import { Customer, CustomerSchema } from '../../models/customer.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    InventoryModule,
    WarehouseModule,
    SalesModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
