import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../models/role.schema';

const SALESMAN_DEFAULT_PERMISSIONS = ['orders.create', 'orders.view', 'customers.view', 'customers.create', 'customers.update', 'payments.entry', 'reports.outstanding', 'stock.view'];

const DEFAULT_ROLES = [
  { name: 'Company Admin', roleType: 'company_admin', orgId: null, permissions: ['*'] },
  { name: 'Salesman', roleType: 'salesman', orgId: null, permissions: SALESMAN_DEFAULT_PERMISSIONS },
  { name: 'B2B Customer', roleType: 'b2b_customer', orgId: null, permissions: ['catalog.view', 'orders.place', 'orders.view', 'invoice.download', 'outstanding.view'] },
];

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureSalesmanCustomerPermissions();
  }

  /** Add customers.create and customers.update to existing Salesman roles (for already-created orgs). */
  private async ensureSalesmanCustomerPermissions() {
    const salesmen = await this.roleModel.find({ roleType: 'salesman' }).exec();
    for (const role of salesmen) {
      const perms = new Set(role.permissions || []);
      if (!perms.has('customers.create')) perms.add('customers.create');
      if (!perms.has('customers.update')) perms.add('customers.update');
      if (perms.size !== (role.permissions?.length ?? 0)) {
        role.permissions = Array.from(perms);
        await role.save();
      }
    }
  }

  async seedDefaultRoles(orgId: string) {
    for (const r of DEFAULT_ROLES) {
      const exists = await this.roleModel.findOne({ orgId, roleType: r.roleType }).exec();
      if (!exists) {
        await this.roleModel.create({ ...r, orgId });
      }
    }
  }

  async getCompanyAdminRole(orgId: string) {
    let r = await this.roleModel.findOne({ orgId, roleType: 'company_admin' }).exec();
    if (!r) {
      await this.seedDefaultRoles(orgId);
      r = await this.roleModel.findOne({ orgId, roleType: 'company_admin' }).exec();
    }
    return r;
  }

  async findAll(orgId: string) {
    const list = await this.roleModel.find({ orgId }).lean().exec();
    return list.map((r: any) => ({ ...r, id: r._id?.toString() }));
  }

  async create(orgId: string, data: Partial<Role>) {
    const r = new this.roleModel({ ...data, orgId });
    return r.save();
  }
}
