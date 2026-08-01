import { Suspense } from "react";
import AdminContentPage from "./page.client";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-ink-400">Se încarcă...</p>}>
      <AdminContentPage />
    </Suspense>
  );
}
