import cloudinary from 'cloudinary';
import 'dotenv/config';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'ecommerce',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadProductImages = async (files) => {
  const uploads = files.map(file =>
    uploadToCloudinary(file.buffer, {
      folder: 'ecommerce/products',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    })
  );
  return Promise.all(uploads);
};

export const uploadAvatar = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'ecommerce/avatars',
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

export const uploadCategoryImage = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'ecommerce/categories',
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, err.message);
  }
};

export default cloudinary;
