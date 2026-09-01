/** Define identidad, rutas y ciclo de vida del contrato HTTP público. */
export const API_NAME = 'Devlog API';
export const API_BASE_PATH = '/api';
export const CURRENT_API_VERSION = 'v1';
export const CURRENT_API_PATH = `${API_BASE_PATH}/${CURRENT_API_VERSION}`;

// La API sin versión quedó deprecada al introducir formalmente /api/v1.
export const LEGACY_API_DEPRECATION_DATE = '@1788048000';
