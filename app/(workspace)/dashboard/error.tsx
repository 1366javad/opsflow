"use client";

import { DataError } from "@/components/ui/data-error";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return <DataError reset={reset} />;
}
