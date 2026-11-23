import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { CREATE_INVOICE_PATH } from "@/lib/routes";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <Suspense fallback={<div className="min-h-[600px]" />}>
        <SignIn forceRedirectUrl={CREATE_INVOICE_PATH} />
      </Suspense>
    </main>
  );
}
