import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const cloudinaryService = {
  /**
   * Uploads a base64 or remote URL image to Cloudinary
   */
  async uploadImage(fileString: string, folder = 'lingoverse/images'): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Fallback to directly returning URL if Cloudinary is not configured yet
      return fileString;
    }
    const result = await cloudinary.uploader.upload(fileString, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  },

  /**
   * Uploads an audio file or base64 audio to Cloudinary
   */
  async uploadAudio(fileString: string, folder = 'lingoverse/audio'): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return fileString;
    }
    const result = await cloudinary.uploader.upload(fileString, {
      folder,
      resource_type: 'video', // Cloudinary treats audio as video resource type
    });
    return result.secure_url;
  },
};
