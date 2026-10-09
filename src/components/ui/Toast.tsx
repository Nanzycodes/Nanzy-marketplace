"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ToastTone = "default" | "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (opts: {
    title: string;
    description?: string;
    tone?: ToastTone;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (opts: { title: string; description?: string; tone?: ToastTone }) => {
      const id = `t-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        {
          id,
          title: opts.title,
          description: opts.description,
          tone: opts.tone || "default",
        },
      ]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = (id: string) =>
    setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[300] flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "rounded-lg border bg-white p-3 shadow-lg text-sm dark:bg-gray-950 dark:border-gray-800",
              t.tone === "success" && "border-green-200 bg-green-50 dark:bg-green-950/40",
              t.tone === "error" && "border-red-200 bg-red-50 dark:bg-red-950/40"
            )}
          >
            <div className="flex justify-between gap-2">
              <p className="font-medium">{t.title}</p>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            {t.description && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op if provider missing
    return {
      toast: (_opts: {
        title: string;
        description?: string;
        tone?: ToastTone;
      }) => {},
    };
  }
  return ctx;
}
