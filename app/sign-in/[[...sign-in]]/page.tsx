import { SignIn } from "@clerk/nextjs";
import { CREATE_INVOICE_PATH } from "@/lib/routes";

// Clerk UI reads the current URL at runtime.
export const instant = false;

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <SignIn forceRedirectUrl={CREATE_INVOICE_PATH} />
    </main>
  );
}
