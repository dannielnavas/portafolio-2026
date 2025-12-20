import type { IArticle } from "@/models/articles.ts";

/**
 * Espera un tiempo determinado en milisegundos
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Realiza una solicitud con retry y backoff exponencial
 * Maneja específicamente errores 429 (rate limiting)
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Si es un error 429, esperamos antes de reintentar
      if (response.status === 429) {
        // Intentar leer el header Retry-After si está disponible
        const retryAfter = response.headers.get("Retry-After");
        let delay = initialDelay * Math.pow(2, attempt);

        if (retryAfter) {
          // Si hay un Retry-After, usarlo (puede estar en segundos)
          const retrySeconds = parseInt(retryAfter, 10);
          delay = retrySeconds * 1000;
        }

        // Si no es el último intento, esperar y reintentar
        if (attempt < maxRetries) {
          console.warn(
            `Rate limit alcanzado (429). Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries + 1})`
          );
          await sleep(delay);
          continue;
        }
      }

      // Si no es 429 o es el último intento, retornar la respuesta
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(
          `Error en solicitud. Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries + 1})`
        );
        await sleep(delay);
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  throw lastError || new Error("Error desconocido en fetchWithRetry");
}

export async function getPostDevto(): Promise<IArticle[]> {
  try {
    const url = "https://dev.to/api/articles?username=dannieldev";
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error("Error fetching posts from Dev.to:", error);
    return [];
  }
}

export async function getPostDevtoBySlug(slug: string): Promise<IArticle | null> {
  try {
    const url = `https://dev.to/api/articles/dannieldev/${slug}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      // Si después de todos los reintentos sigue siendo 429, retornar null
      if (response.status === 429) {
        console.error(
          "Rate limit alcanzado después de todos los reintentos. No se pudo obtener el post."
        );
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const article = await response.json();
    return article;
  } catch (error) {
    console.error("Error fetching post from Dev.to:", error);
    return null;
  }
}
