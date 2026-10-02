"use client";

import { DataError } from "@/components/ui/data-error";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <DataError reset={reset} />
    </main>
  );
}
