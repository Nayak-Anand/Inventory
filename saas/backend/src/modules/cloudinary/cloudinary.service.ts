import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  isConfigured(): boolean {
    return !!(this.config.get('CLOUDINARY_CLOUD_NAME') && this.config.get('CLOUDINARY_API_KEY') && this.config.get('CLOUDINARY_API_SECRET'));
  }

  async uploadImage(dataUrl: string, folder = 'inventory/profiles'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env');
    }
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
