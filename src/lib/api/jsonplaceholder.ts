/**
 * Free JSONPlaceholder API — https://jsonplaceholder.typicode.com
 * No API key. Used for demo comments / social proof on product pages.
 */
import { fetchJson } from "./http";

export type JpComment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export type JpUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

const BASE = "https://jsonplaceholder.typicode.com";

/** Map a product id (string or number) to a stable postId 1–100 */
export function productIdToPostId(productId: string | number): number {
  const raw =
    typeof productId === "number"
      ? productId
      : productId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (Math.abs(raw) % 100) + 1;
}

export async function getCommentsForPost(
  postId: number,
  signal?: AbortSignal
): Promise<JpComment[]> {
  return fetchJson<JpComment[]>(`${BASE}/posts/${postId}/comments`, {
    signal,
  });
}

export async function getUsers(signal?: AbortSignal): Promise<JpUser[]> {
  return fetchJson<JpUser[]>(`${BASE}/users`, { signal });
}
