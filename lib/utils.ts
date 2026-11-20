import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Small uppercase field/section labels: Geist Mono.
// Light theme: white text on black. Dark theme: black text on white.
export const monoLabelClass =
  "mb-2 block w-fit rounded-md bg-black px-2 py-1 font-mono text-[16px] text-white dark:bg-white dark:text-black"
