import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../../models/customer.schema';
import { Invoice, InvoiceDocument } from '../../models/invoice.schema';
import { InventoryService } from '../inventory/inventory.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private cloudinary: CloudinaryService,
  ) {}

  private async processAvatar(avatarData: string | undefined): Promise<string | undefined> {
    if (!avatarData) return undefined;
    if (avatarData.startsWith('data:image/') && this.cloudinary.isConfigured()) {
      try {
        return await this.cloudinary.uploadImage(avatarData, 'inventory/customers');
      } catch {
        return avatarData;
      }
    }
    return avatarData;
  }

  async createCustomer(orgId: string, data: Partial<Customer> & { avatar?: string }): Promise<any> {
    const { avatar: avatarData, ...rest } = data;
    const avatar = await this.processAvatar(avatarData);
    const c = new this.customerModel({ ...rest, orgId, ...(avatar && { avatar }) });
    const saved = await c.save();
    const out = saved.toObject ? saved.toObject() : saved;
    return { ...out, id: (out as any)._id?.toString() };
  }

  async listCustomers(orgId: string, user?: { roleType?: string; assignedCustomerIds?: string[] }) {
    const filter: any = { orgId };
    if (user?.roleType === 'salesman' || user?.roleType === 'b2b_customer') {
      const ids = user.assignedCustomerIds || [];
      if (ids.length === 0) return [];
      filter._id = { $in: ids };
    }
    const list = await this.customerModel.find(filter).sort({ name: 1 }).lean().exec();
    return list.map((c: any) => ({ ...c, id: c._id?.toString() }));
  }

  async updateCustomer(orgId: string, id: string, data: Partial<Customer> & { avatar?: string }): Promise<any> {
    const c = await this.customerModel.findOne({ _id: id, orgId }).exec();
    if (!c) throw new BadRequestException('Customer not found');
    if (data.avatar !== undefined) {
      (c as any).avatar = data.avatar === '' ? undefined : (await this.processAvatar(data.avatar) ?? (c as any).avatar);
    }
    const { avatar: _a, ...rest } = data;
    Object.assign(c, rest);
    await c.save();
    const out = c.toObject ? c.toObject() : c;
    return { ...out, id: (out as any)._id?.toString() };
  }

  async deleteCustomer(orgId: string, id: string) {
    await this.customerModel.deleteOne({ _id: id, orgId }).exec();
    return { success: true };
  }

  async createInvoice(
    orgId: string,
    warehouseId: string,
    data: {
      customerId: string;
      date: string;
      dueDate?: string;
      gstType: string;
      gstRate: number;
      items: { itemId: string; itemName: string; quantity: number; rate: number; unit?: string }[];
    },
  ): Promise<any> {
    let whId = warehouseId;
    if (!whId) {
      const warehouses = await this.warehouseService.findAll(orgId);
      whId = warehouses[0]?.id;
    }
    if (!whId) throw new BadRequestException('No warehouse found. Create a warehouse first.');
    const customer = await this.customerModel.findOne({ _id: data.customerId, orgId }).exec();
    if (!customer) throw new BadRequestException('Customer not found');

    const count = await this.invoiceModel.countDocuments({ orgId });
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    const lines: Array<{ itemId: string; itemName: string; quantity: number; unit: string; rate: number; amount: number; taxAmount: number }> = [];
    let subtotal = 0;
    for (const it of data.items) {
      const amount = it.quantity * it.rate;
      subtotal += amount;
      lines.push({
        itemId: it.itemId,
        itemName: it.itemName,
        quantity: it.quantity,
        unit: it.unit || 'pcs',
        rate: it.rate,
        amount,
        taxAmount: 0,
      });
    }

    const gstAmount = (subtotal * (data.gstRate || 0)) / 100;
    const cgst = data.gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
    const sgst = data.gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
    const igst = data.gstType === 'igst' ? gstAmount : 0;
    const grandTotal = subtotal + gstAmount;

    const invoice = new this.invoiceModel({
      orgId,
      invoiceNumber,
      customerId: data.customerId,
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(data.date),
      status: 'sent',
      paymentStatus: 'pending',
      gstType: data.gstType,
      subtotal,
      cgst,
      sgst,
      igst,
      grandTotal,
      lines,
    });
    await invoice.save();

    for (const it of data.items) {
      await this.inventoryService.reduceStock(orgId, whId, it.itemId, it.quantity, 'sale', invoice._id.toString());
    }

    const saved = await this.invoiceModel.findById(invoice._id).lean().exec();
    return saved ? { ...saved, id: saved._id?.toString() } : saved;
  }

  /** Create invoice from an approved order (called automatically on order approve) */
  async createInvoiceFromOrder(
    orgId: string,
    order: { _id: any; customerId: string; lines: Array<{ itemId: string; itemName: string; quantity: number; unit?: string; rate: number; amount: number; gstRate?: number }>; subtotal: number; grandTotal: number; taxAmount?: number; date: Date },
  ): Promise<{ id: string; _id: any }> {
    const warehouses = await this.warehouseService.findAll(orgId);
    const whId = warehouses[0]?.id;
    if (!whId) throw new BadRequestException('No warehouse found. Create a warehouse first.');

    const count = await this.invoiceModel.countDocuments({ orgId });
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    let totalTax = 0;
    const lines = (order.lines || []).map((l) => {
      const gstRate = l.gstRate ?? 18;
      const lineTax = (l.amount * gstRate) / 100;
      totalTax += lineTax;
      return {
        itemId: l.itemId,
        itemName: l.itemName,
        quantity: l.quantity,
        unit: l.unit || 'pcs',
        rate: l.rate,
        amount: l.amount,
        taxAmount: Math.round(lineTax * 100) / 100,
      };
    });

    const subtotal = order.subtotal ?? 0;
    const grandTotal = subtotal + totalTax;
    const cgst = Math.round((totalTax / 2) * 100) / 100;
    const sgst = Math.round((totalTax / 2) * 100) / 100;

    const invoice = new this.invoiceModel({
      orgId,
      invoiceNumber,
      customerId: order.customerId,
      date: order.date ? new Date(order.date) : new Date(),
      dueDate: order.date ? new Date(order.date) : new Date(),
      status: 'sent',
      paymentStatus: 'pending',
      gstType: 'cgst_sgst',
      subtotal,
      cgst,
      sgst,
      igst: 0,
      grandTotal,
      lines,
    });
    await invoice.save();

    for (const line of order.lines || []) {
      await this.inventoryService.reduceStock(orgId, whId, line.itemId, line.quantity, 'sale', invoice._id.toString());
    }

    return { id: invoice._id?.toString(), _id: invoice._id };
  }

  async listInvoices(orgId: string, user?: { roleType?: string; assignedCustomerIds?: string[] }) {
    const filter: any = { orgId };
    if (user?.roleType === 'salesman' || user?.roleType === 'b2b_customer') {
      const ids = user.assignedCustomerIds || [];
      if (ids.length === 0) return [];
      filter.customerId = { $in: ids };
    }
    const list = await this.invoiceModel.find(filter).sort({ createdAt: -1 }).lean().exec();
    const customerIds = [...new Set(list.map((inv: any) => inv.customerId))];
    const customers = await this.customerModel.find({ _id: { $in: customerIds } }).lean().exec();
    const customerMap = Object.fromEntries(customers.map((c: any) => [c._id.toString(), c]));
    return list.map((inv: any) => ({
      ...inv,
      id: inv._id?.toString(),
      customer: customerMap[inv.customerId],
    }));
  }

  async markInvoicePaid(orgId: string, invoiceId: string, user: { id?: string; name?: string }) {
    const inv = await this.invoiceModel.findOne({ _id: invoiceId, orgId }).exec();
    if (!inv) throw new BadRequestException('Invoice not found');
    inv.paymentStatus = 'paid';
    inv.paymentReceivedAt = new Date();
    if (user?.id) inv.markedByUserId = user.id;
    if (user?.name) inv.markedByName = user.name;
    return inv.save();
  }
}
