/** Comunica la deprecación del contrato sin versión sin cambiar su comportamiento. */
import {
    CURRENT_API_PATH,
    LEGACY_API_DEPRECATION_DATE,
} from '../config/api.js';

export const markLegacyApiAsDeprecated = (req, res, next) => {
    // Deprecation usa el formato de fecha estructurada definido por RFC 9745.
    res.set('deprecation', LEGACY_API_DEPRECATION_DATE);
    res.set('link', `<${CURRENT_API_PATH}>; rel="successor-version"`);

    // Se conserva durante la transición para clientes que ya consumen esta cabecera.
    res.set('x-api-deprecated', 'true');
    next();
};
