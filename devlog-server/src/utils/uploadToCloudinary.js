/** Adapta la API de streams de Cloudinary a promesas utilizadas por los servicios. */
import cloudinary from '../config/cloudinary.js';

/** Sube un buffer validado y devuelve el resultado completo de Cloudinary. */
export const uploadToCloudinary = (fileBuffer, folder = 'red-social') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/** Elimina un recurso remoto cuando existe un identificador persistido. */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};
