import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Sign up — Campus-Crave" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Order from your campus canteen, or bring your canteen online."
    >
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
