/**
 * Shared HTTP helpers for free third-party APIs.
 * Demonstrates: typed errors, timeout, abort, JSON parsing.
 */

export class ApiError extends Error {
  status: number;
  body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type FetchJsonOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: HeadersInit;
  method?: string;
  body?: unknown;
};

/**
 * fetch JSON with timeout + clear errors (frontend-standard pattern).
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { signal, timeoutMs = 12000, headers, method = "GET", body } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  // Combine external abort with timeout
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Public APIs — ok to cache briefly on the server
      next: { revalidate: 60 },
    } as RequestInit);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(
        `Request failed (${res.status})`,
        res.status,
        text.slice(0, 200)
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timed out or was cancelled", 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}
