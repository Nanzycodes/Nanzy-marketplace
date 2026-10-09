/**
 * Simple className merger.
 * Later we will replace this with clsx + tailwind-merge when we add shadcn/ui.
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
