"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useTheme } from "next-themes";
import WaveMesh from "@/components/ui/wave-mesh";

const LIGHT: [string, string, string] = ["#ffffff", "#1b1a17", "#3f3f46"];
const DARK: [string, string, string] = ["#000000", "#d4d4d8", "#3f3f46"];

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function HeroWave({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const colors = mounted && resolvedTheme === "dark" ? DARK : LIGHT;

  return (
    <WaveMesh colors={colors} crests={false} className="w-full flex-1">
      {children}
    </WaveMesh>
  );
}
