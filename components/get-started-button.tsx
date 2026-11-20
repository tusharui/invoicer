"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CREATE_INVOICE_PATH } from "@/lib/routes";

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

  // New visitors sign up first, then land on the create-invoice screen.
  return (
    <SignUpButton mode="modal" forceRedirectUrl={CREATE_INVOICE_PATH}>
      <ShimmerButton type="button" className={className} disabled={!isLoaded}>
        Get Started
      </ShimmerButton>
    </SignUpButton>
  );
}
