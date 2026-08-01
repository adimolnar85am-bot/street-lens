import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-ink-400 text-sm">
          Se încarcă…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
