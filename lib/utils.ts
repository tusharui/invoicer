import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Small uppercase field/section labels: Geist Mono, white on solid black.
export const monoLabelClass =
  "mb-2 block w-fit rounded-md bg-black px-2 py-1 font-mono text-[16px] f text-white"
