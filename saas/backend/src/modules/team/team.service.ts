import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../models/user.schema';
import { Customer, CustomerDocument } from '../../models/customer.schema';
import { RoleService } from '../role/role.service';
import { Role, RoleDocument } from '../../models/role.schema';
import { Order, OrderDocument } from '../../models/order.schema';
import { Invoice, InvoiceDocument } from '../../models/invoice.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
    private roleService: RoleService,
    private cloudinary: CloudinaryService,
  ) {}

  private async resolveRole(orgId: string, roleType: string): Promise<RoleDocument> {
    let role = await this.roleModel.findOne({ orgId, roleType }).exec();
    if (!role) {
      await this.roleService.seedDefaultRoles(orgId);
      role = await this.roleModel.findOne({ orgId, roleType }).exec();
    }
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  async list(orgId: string) {
    const [users, customers, roles] = await Promise.all([
      this.userModel.find({ orgId, isDeleted: false, roleId: { $ne: null } }).lean().exec(),
      this.customerModel.find({ orgId, isDeleted: false }).lean().exec(),
      this.roleModel.find({ orgId }).lean().exec(),
    ]);
    const customerMap = Object.fromEntries(
      customers.map((c: any) => [c._id.toString(), c]),
    );
    const roleMap = Object.fromEntries(
      roles.map((r: any) => [r._id.toString(), r]),
    );
    return users.map((u: any) => ({
      id: u._id?.toString(),
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      avatar: u.avatar,
      roleId: u.roleId,
      role: roleMap[u.roleId],
      assignedCustomerIds: u.assignedCustomerIds || [],
      assignedCustomers: (u.assignedCustomerIds || []).map((cid: string) => customerMap[cid]).filter(Boolean),
      isActive: u.isActive,
    }));
  }

  private async processAvatar(avatarData: string | undefined): Promise<string | undefined> {
    if (!avatarData) return undefined;
    if (avatarData.startsWith('data:image/') && this.cloudinary.isConfigured()) {
      try {
        return await this.cloudinary.uploadImage(avatarData);
      } catch {
        return avatarData;
      }
    }
    return avatarData;
  }

  async create(orgId: string, data: { name: string; mobile: string; email?: string; password: string; roleType: string; assignedCustomerIds?: string[]; avatar?: string }) {
    const role = await this.resolveRole(orgId, data.roleType);
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const avatar = await this.processAvatar(data.avatar);
    const user = new this.userModel({
      orgId,
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      passwordHash,
      roleId: role._id.toString(),
      assignedCustomerIds: data.assignedCustomerIds || [],
      ...(avatar && { avatar }),
    });
    await user.save();
    return {
      id: user._id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      avatar: user.avatar,
      roleId: user.roleId,
      role,
      assignedCustomerIds: user.assignedCustomerIds,
    };
  }

  async update(orgId: string, id: string, data: Partial<{ name: string; mobile: string; email?: string; roleType: string; assignedCustomerIds: string[]; avatar?: string }>) {
    const user = await this.userModel.findOne({ _id: id, orgId }).exec();
    if (!user || user.isDeleted) throw new BadRequestException('User not found');
    if (data.name !== undefined) user.name = data.name;
    if (data.mobile !== undefined) user.mobile = data.mobile;
    if (data.email !== undefined) user.email = data.email;
    if (data.roleType) {
      const role = await this.resolveRole(orgId, data.roleType);
      user.roleId = role._id.toString();
    }
    if (data.assignedCustomerIds) {
      user.assignedCustomerIds = data.assignedCustomerIds;
    }
    if (data.avatar !== undefined) {
      user.avatar = data.avatar === '' ? undefined : (await this.processAvatar(data.avatar) ?? user.avatar);
    }
    await user.save();
    return {
      id: user._id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      avatar: user.avatar,
      roleId: user.roleId,
      assignedCustomerIds: user.assignedCustomerIds,
    };
  }

  async resetPassword(orgId: string, userId: string, newPassword: string) {
    const user = await this.userModel.findOne({ _id: userId, orgId }).exec();
    if (!user || user.isDeleted) throw new BadRequestException('User not found');
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();
    return { message: 'Password reset successfully' };
  }

  async softDelete(orgId: string, id: string) {
    const user = await this.userModel.findOne({ _id: id, orgId }).exec();
    if (!user) throw new BadRequestException('User not found');
    user.isDeleted = true;
    user.isActive = false;
    await user.save();
    return { success: true };
  }

  /** Salesman-wise: order count, total sales, payment received, pending (optional date range) */
  async salesmanPerformance(orgId: string, fromDate?: string, toDate?: string) {
    const salesmanRole = await this.roleModel.findOne({ orgId, roleType: 'salesman' }).lean().exec();
    if (!salesmanRole) return [];
    const salesmen = await this.userModel
      .find({ orgId, roleId: salesmanRole._id.toString(), isDeleted: false })
      .select('name mobile email avatar')
      .lean()
      .exec();

    const orderFilter: any = { orgId, isDeleted: false };
    if (fromDate || toDate) {
      orderFilter.date = {};
      if (fromDate) orderFilter.date.$gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        orderFilter.date.$lte = to;
      }
    }

    const result = await Promise.all(
      salesmen.map(async (u: any) => {
        const userId = u._id.toString();
        const orders = await this.orderModel
          .find({ ...orderFilter, salesmanId: userId })
          .lean()
          .exec();
        const orderCount = orders.length;
        const totalSales = orders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
        const invoiceIds = orders.map((o: any) => o.invoiceId).filter(Boolean);
        let paymentReceived = 0;
        let pending = 0;
        if (invoiceIds.length > 0) {
          const invoices = await this.invoiceModel
            .find({ _id: { $in: invoiceIds }, orgId })
            .lean()
            .exec();
          invoices.forEach((inv: any) => {
            const amt = inv.grandTotal || 0;
            if (inv.paymentStatus === 'paid') paymentReceived += amt;
            else pending += amt;
          });
        }
        return {
          id: userId,
          name: u.name,
          mobile: u.mobile,
          email: u.email,
          avatar: u.avatar, // same as Team Members (user profile image)
          orderCount,
          totalSales: Math.round(totalSales * 100) / 100,
          paymentReceived: Math.round(paymentReceived * 100) / 100,
          pending: Math.round(pending * 100) / 100,
        };
      }),
    );
    return result;
  }

  /** Detailed breakdown: customers, orders, invoices with payment status and due dates */
  async salesmanDetails(orgId: string, salesmanId: string, fromDate?: string, toDate?: string) {
    const orderFilter: any = { orgId, salesmanId, isDeleted: false };
    if (fromDate || toDate) {
      orderFilter.date = {};
      if (fromDate) orderFilter.date.$gte = new Date(fromDate);
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        orderFilter.date.$lte = to;
      }
    }

    const orders = await this.orderModel.find(orderFilter).lean().exec();
    const invoiceIds = orders.map((o: any) => o.invoiceId).filter(Boolean);
    const invoices = invoiceIds.length > 0
      ? await this.invoiceModel.find({ _id: { $in: invoiceIds }, orgId }).lean().exec()
      : [];
    const invoiceMap = Object.fromEntries(invoices.map((inv: any) => [inv._id.toString(), inv]));

    const customerIds = [...new Set(orders.map((o: any) => o.customerId))];
    const customers = await this.customerModel.find({ _id: { $in: customerIds } }).lean().exec();
    const customerMap = Object.fromEntries(customers.map((c: any) => [c._id.toString(), c]));

    const customerStats: Record<string, {
      customer: any;
      orders: any[];
      invoices: any[];
      orderCount: number;
      totalSales: number;
      paymentReceived: number;
      pending: number;
    }> = {};

    orders.forEach((o: any) => {
      const cid = o.customerId;
      if (!customerStats[cid]) {
        customerStats[cid] = {
          customer: customerMap[cid],
          orders: [],
          invoices: [],
          orderCount: 0,
          totalSales: 0,
          paymentReceived: 0,
          pending: 0,
        };
      }
      customerStats[cid].orders.push(o);
      customerStats[cid].orderCount++;
      customerStats[cid].totalSales += o.grandTotal || 0;

      if (o.invoiceId && invoiceMap[o.invoiceId]) {
        const inv = invoiceMap[o.invoiceId];
        customerStats[cid].invoices.push(inv);
        const amt = inv.grandTotal || 0;
        if (inv.paymentStatus === 'paid') {
          customerStats[cid].paymentReceived += amt;
        } else {
          customerStats[cid].pending += amt;
        }
      }
    });

    return Object.values(customerStats).map((stat) => ({
      customer: {
        id: stat.customer?._id?.toString(),
        name: stat.customer?.name || 'Unknown',
        email: stat.customer?.email,
        phone: stat.customer?.phone,
      },
      orderCount: stat.orderCount,
      totalSales: Math.round(stat.totalSales * 100) / 100,
      paymentReceived: Math.round(stat.paymentReceived * 100) / 100,
      pending: Math.round(stat.pending * 100) / 100,
      invoices: stat.invoices.map((inv: any) => ({
        id: inv._id?.toString(),
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        dueDate: inv.dueDate,
        grandTotal: inv.grandTotal || 0,
        paymentStatus: inv.paymentStatus,
        paymentReceivedAt: inv.paymentReceivedAt,
      })),
    }));
  }
}

