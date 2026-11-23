import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Small field/section labels: Geist Mono.
export const monoLabelClass =
  "mb-1 block font-mono text-base tracking-wide text-black dark:text-white"
