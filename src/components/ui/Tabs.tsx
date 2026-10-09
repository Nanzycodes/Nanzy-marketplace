"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "flex flex-wrap gap-1 border-b dark:border-gray-800",
        className
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`tab-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => {
              const idx = items.findIndex((t) => t.id === value);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                onChange(items[(idx + 1) % items.length].id);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                onChange(items[(idx - 1 + items.length) % items.length].id);
              }
            }}
            className={cn(
              "rounded-t-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
              selected
                ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
