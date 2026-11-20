"use client";

import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function GetStartedButton() {
  const router = useRouter();
  return (
    <ShimmerButton
      type="button"
      className="h-12 w-full text-xl font-semibold sm:w-[184px]"
      onClick={() => router.push("/dashboard")}
    >
      Get Started
    </ShimmerButton>
  );
}
