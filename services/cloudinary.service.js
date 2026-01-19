const cloudinary = require('cloudinary').v2;

/**
 * Servicio de almacenamiento en la nube usando Cloudinary (GRATIS)
 * Registrate en: https://cloudinary.com/
 * Plan gratuito: 25 GB almacenamiento, 25 GB bandwidth/mes
 */
class CloudinaryService {
  constructor() {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.enabled = true;
    } else {
      console.warn(
        'Cloudinary no configurado. Los archivos no se subirán a la nube.'
      );
      this.enabled = false;
    }
  }

  /**
   * Sube un archivo a Cloudinary
   */
  async uploadFile(buffer, options = {}) {
    if (!this.enabled) {
      return {
        url: null,
        public_id: null,
        message: 'Cloudinary no configurado',
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'proformas',
          resource_type: options.resource_type || 'auto',
          public_id: options.public_id,
          overwrite: options.overwrite !== false,
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              size: result.bytes,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Elimina un archivo de Cloudinary
   */
  async deleteFile(publicId) {
    if (!this.enabled) return { message: 'Cloudinary no configurado' };

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  /**
   * Obtiene URL optimizada de una imagen
   */
  getOptimizedUrl(publicId, options = {}) {
    if (!this.enabled) return null;

    return cloudinary.url(publicId, {
      quality: options.quality || 'auto',
      fetch_format: options.format || 'auto',
      width: options.width,
      height: options.height,
      crop: options.crop || 'limit',
      ...options,
    });
  }
}

module.exports = new CloudinaryService();
