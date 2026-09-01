/** Valida tamaño, MIME declarado y firma binaria antes de aceptar imágenes. */
import multer from 'multer';

// Se mantiene en memoria porque el siguiente límite es Cloudinary, no el filesystem local.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite coherente con la validación del cliente.
});

/** Detecta formatos permitidos por sus magic bytes, sin confiar en la extensión. */
const detectImageMimeType = (buffer) => {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }

    if (
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
        return 'image/png';
    }

    if (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
        return 'image/webp';
    }

    return null;
};

/** Rechaza archivos cuyo contenido no coincide con el MIME declarado. */
export const validateUploadedImage = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const detectedMimeType = detectImageMimeType(req.file.buffer);
    if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
        const error = new Error('El archivo no contiene una imagen JPG, PNG o WEBP válida');
        error.statusCode = 422;
        return next(error);
    }

    return next();
};
