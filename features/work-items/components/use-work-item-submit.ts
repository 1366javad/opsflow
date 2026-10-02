"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type WorkItemFormSubmission = {
  title: string;
  description: string;
  assigneeId: string;
  priority: string;
  dueDate: string;
  status?: string;
};
type MutationError = { message?: string; fieldErrors?: Record<string, string[]> };

export function useWorkItemSubmit(itemId?: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(input: WorkItemFormSubmission): Promise<void> {
    setPending(true);
    setError("");
    setFieldErrors({});
    try {
      const response = await fetch(itemId ? `/api/work-items/${itemId}` : "/api/work-items", {
        method: itemId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const responseBody: MutationError & { id?: string } = await response.json();
      if (!response.ok) {
        setError(responseBody.message ?? "Could not save this work item.");
        setFieldErrors(responseBody.fieldErrors ?? {});
        return;
      }
      if (!responseBody.id) throw new Error("Work item ID missing from response.");
      router.push(`/work-items/${responseBody.id}?message=${itemId ? "updated" : "created"}`);
      router.refresh();
    } catch {
      setError("Could not save this work item. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, error, fieldErrors };
}
