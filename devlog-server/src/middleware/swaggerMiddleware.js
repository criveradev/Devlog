/** Ajusta CSP exclusivamente para los recursos estáticos e inline de Swagger UI. */
export const allowSwaggerUiAssets = (req, res, next) => {
    res.set(
        'content-security-policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self' data:",
        ].join('; ')
    );
    next();
};
