import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../models/user.schema';
import { Customer, CustomerSchema } from '../../models/customer.schema';
import { Role, RoleSchema } from '../../models/role.schema';
import { Order, OrderSchema } from '../../models/order.schema';
import { Invoice, InvoiceSchema } from '../../models/invoice.schema';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { RoleModule } from '../role/role.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    RoleModule,
    CloudinaryModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}

