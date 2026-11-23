import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Small field/section labels.
export const monoLabelClass =
  "mb-1 block text-base font-medium text-black dark:text-white"
