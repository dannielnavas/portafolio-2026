import type { IArticle } from '@/models/articles.ts';

/**
 * Agrupa y ordena posts por año de publicación
 * @param posts Array de artículos
 * @returns Array de objetos con año y posts ordenados
 */
export function groupPostsByYear(posts: IArticle[]): Array<{ year: string; posts: IArticle[] }> {
    // Ordenar por año de publicación (más reciente primero)
    const orderedByYear = [...posts].sort(
        (a, b) => new Date(b.published_at).getFullYear() - new Date(a.published_at).getFullYear()
    );

    // Agrupar por año
    const groupedByYear = orderedByYear.reduce(
        (acc: Record<string, IArticle[]>, post) => {
            const year = new Date(post.published_at).getFullYear().toString();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(post);
            return acc;
        },
        {}
    );

    // Obtener años ordenados (más reciente primero)
    const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

    // Retornar array con año y posts
    return years.map((year) => ({
        year,
        posts: groupedByYear[year],
    }));
}
