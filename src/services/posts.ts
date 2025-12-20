import type { IArticle } from "@/models/articles.ts";

export async function getPostDevto(): Promise<IArticle[]> {
  try {
    const url = "https://dev.to/api/articles?username=dannieldev";
    const response = await fetch(url);

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
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
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
