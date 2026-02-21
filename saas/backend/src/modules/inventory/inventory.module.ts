import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from '../../models/item.schema';
import { InventoryLedger, InventoryLedgerSchema } from '../../models/inventory-ledger.schema';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: InventoryLedger.name, schema: InventoryLedgerSchema },
    ]),
    WarehouseModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
