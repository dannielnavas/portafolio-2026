/**
 * Valida si un slug es válido para usar en rutas
 */
export function isValidSlug(slug: string | undefined): boolean {
    if (!slug) {
        return false;
    }

    // Filtrar slugs inválidos o que parezcan archivos estáticos
    const invalidPatterns = [
        '.map',
        '.js',
        '.css',
        '/',
        '//',
        '.',
    ];

    return (
        slug.length > 0 &&
        !invalidPatterns.some(pattern => slug.includes(pattern))
    );
}
