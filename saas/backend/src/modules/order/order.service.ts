import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../models/order.schema';
import { Customer, CustomerDocument } from '../../models/customer.schema';
import { InventoryService } from '../inventory/inventory.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private salesService: SalesService,
  ) {}

  async create(orgId: string, data: any, user?: { id?: string; sub?: string; roleType?: string; assignedCustomerIds?: string[] }) {
    const customer = await this.customerModel.findOne({ _id: data.customerId, orgId }).exec();
    if (!customer) throw new BadRequestException('Customer not found');
    if (user?.roleType === 'salesman' || user?.roleType === 'b2b_customer') {
      const allowed = user.assignedCustomerIds || [];
      if (!allowed.includes(data.customerId)) throw new BadRequestException('Not allowed to create order for this customer');
    }

    const salesmanId = user?.id || user?.sub;
    const count = await this.orderModel.countDocuments({ orgId }).exec();
    const orderNumber = `ORD-${String(count + 1).padStart(5, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    const lines = await Promise.all(
      (data.items || []).map(async (it: any) => {
        const item = await this.inventoryService.getItem(orgId, it.itemId);
        const gstRate = item?.gstRate ?? 18;
        const amount = (it.quantity || 0) * (it.rate || 0);
        const lineTax = (amount * gstRate) / 100;
        subtotal += amount;
        taxAmount += lineTax;
        return {
          itemId: it.itemId,
          itemName: it.itemName || it.name,
          quantity: it.quantity || 0,
          unit: it.unit || 'pcs',
          rate: it.rate || 0,
          amount,
          gstRate,
        };
      }),
    );

    const grandTotal = subtotal + taxAmount;

    const order = new this.orderModel({
      orgId,
      orderNumber,
      customerId: data.customerId,
      salesmanId,
      date: new Date(data.date || Date.now()),
      status: 'pending',
      approvalStatus: 'pending',
      subtotal,
      taxAmount,
      grandTotal,
      lines,
    });
    await order.save();
    return { ...order.toObject(), id: order._id?.toString() };
  }

  async list(orgId: string, user?: { roleType?: string; assignedCustomerIds?: string[] }) {
    const filter: any = { orgId, isDeleted: false };
    if (user?.roleType === 'salesman' || user?.roleType === 'b2b_customer') {
      const ids = user.assignedCustomerIds || [];
      if (ids.length === 0) return [];
      filter.customerId = { $in: ids };
    }
    const list = await this.orderModel.find(filter).sort({ createdAt: -1 }).lean().exec();
    const customerIds = [...new Set(list.map((o: any) => o.customerId))];
    const customers = await this.customerModel.find({ _id: { $in: customerIds } }).lean().exec();
    const customerMap = Object.fromEntries(customers.map((c: any) => [c._id.toString(), c]));
    return list.map((o: any) => ({
      ...o,
      id: o._id?.toString(),
      customer: customerMap[o.customerId],
    }));
  }

  async approve(orgId: string, orderId: string, userId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, orgId }).exec();
    if (!order) throw new BadRequestException('Order not found');
    if (order.invoiceId) throw new BadRequestException('Invoice already created for this order');

    order.approvalStatus = 'approved';
    order.approvedBy = userId;
    order.approvedAt = new Date();
    order.status = 'approved';
    await order.save();

    const invoice = await this.salesService.createInvoiceFromOrder(orgId, order);
    order.invoiceId = invoice.id;
    await order.save();

    return { ...order.toObject(), id: order._id?.toString(), invoiceId: invoice.id };
  }

  async reject(orgId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, orgId }).exec();
    if (!order) throw new BadRequestException('Order not found');
    order.approvalStatus = 'rejected';
    order.status = 'rejected';
    await order.save();
    return { ...order.toObject(), id: order._id?.toString() };
  }
}
