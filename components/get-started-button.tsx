"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CREATE_INVOICE_PATH, DEMO_INVOICE_PATH } from "@/lib/routes";

export function GetStartedButton() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  const className = "h-12 w-full text-xl font-semibold sm:w-[184px]";

  // Already registered? Take them straight to the create-invoice screen.
  if (isLoaded && isSignedIn) {
    return (
      <ShimmerButton
        type="button"
        className={className}
        onClick={() => router.push(CREATE_INVOICE_PATH)}
      >
        Create Invoice
      </ShimmerButton>
    );
  }

  // New visitors can try the product before creating an account.
  return (
    <ShimmerButton
      type="button"
      className={className}
      disabled={!isLoaded}
      onClick={() => router.push(DEMO_INVOICE_PATH)}
    >
      Try Free Demo
    </ShimmerButton>
  );
}