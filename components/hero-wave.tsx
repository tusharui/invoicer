"use client";

import type { ReactNode } from "react";
import { useTheme } from "next-themes";
import WaveMesh from "@/components/ui/wave-mesh";

const LIGHT: [string, string, string] = ["#ffffff", "#1b1a17", "#3f3f46"];
const DARK: [string, string, string] = ["#06070a", "#c9d6ea", "#3f3f46"];

/** Theme-aware WaveMesh wrapper (the canvas needs concrete hex colors). */
export function HeroWave({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === "dark" ? DARK : LIGHT;

  return (
    <WaveMesh colors={colors} crests={false} className="w-full flex-1">
      {children}
    </WaveMesh>
  );
}
