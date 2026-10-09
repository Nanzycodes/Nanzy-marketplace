"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

/**
 * Generic client-side data-fetching hook.
 * Skills demo: AbortController, loading/error/retry, dependency refetch.
 */
export function useAsyncResource<T>(
  factory: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  const load = useCallback(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    factoryRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", data });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        setState({ status: "error", error: message });
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const retry = () => {
    load();
  };

  return { state, retry, reload: retry };
}
