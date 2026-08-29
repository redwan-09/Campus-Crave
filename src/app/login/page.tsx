import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Log in — Campus-Crave" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to order, manage your canteen, or run the platform."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
