import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../../models/organization.schema';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
  ) {}

  async findBySlug(slug: string): Promise<OrganizationDocument | null> {
    return this.orgModel.findOne({ slug }).exec();
  }

  async findById(id: string): Promise<OrganizationDocument | null> {
    return this.orgModel.findById(id).exec();
  }

  async createOrganization(data: { name: string; slug: string; businessName?: string }) {
    const org = new this.orgModel({
      name: data.name,
      slug: data.slug,
      businessName: data.businessName || data.name,
    });
    return org.save();
  }

  async getSettings(orgId: string) {
    const org = await this.orgModel.findById(orgId).lean().exec();
    if (!org) return null;
    return {
      businessName: org.businessName || org.name || 'My Business',
      address: org.address || '',
      gstin: org.gstin || '',
      state: org.state || '',
      stateCode: org.stateCode || '',
      logo: org.logo || '',
      watermarkImage: org.watermarkImage || '',
    };
  }

  async updateSettings(orgId: string, data: { businessName?: string; address?: string; gstin?: string; state?: string; stateCode?: string; logo?: string; watermarkImage?: string }) {
    const org = await this.orgModel.findById(orgId).exec();
    if (!org) return null;
    if (data.businessName !== undefined) org.businessName = data.businessName;
    if (data.address !== undefined) org.address = data.address;
    if (data.gstin !== undefined) org.gstin = data.gstin;
    if (data.state !== undefined) org.state = data.state;
    if (data.stateCode !== undefined) org.stateCode = data.stateCode;
    if (data.logo !== undefined) org.logo = data.logo;
    if (data.watermarkImage !== undefined) org.watermarkImage = data.watermarkImage;
    await org.save();
    return this.getSettings(orgId);
  }
}
