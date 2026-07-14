import { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { UploadedFile } from '../types';
import logger from '../utils/logger';

export async function uploadImage(
  buffer: Buffer,
  folder: string,
  options: Partial<UploadApiOptions> = {}
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        logger.error('Cloudinary upload error:', error);
        reject(error || new Error('Upload failed'));
        return;
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
      });
    });

    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary image deleted: ${publicId}`);
  } catch (error) {
    logger.error(`Cloudinary delete error for ${publicId}:`, error);
    throw error;
  }
}

export async function replaceImage(
  buffer: Buffer,
  folder: string,
  oldPublicId?: string | null,
  options: Partial<UploadApiOptions> = {}
): Promise<UploadedFile> {
  // Upload new image first
  const uploaded = await uploadImage(buffer, folder, options);

  // Delete old image after successful upload
  if (oldPublicId) {
    await deleteImage(oldPublicId).catch((err) =>
      logger.warn(`Could not delete old image ${oldPublicId}: ${err.message}`)
    );
  }

  return uploaded;
}
