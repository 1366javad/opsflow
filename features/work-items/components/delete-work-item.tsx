"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteWorkItem({ itemId, title }: { itemId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/work-items/${itemId}`, { method: "DELETE" });
      if (!response.ok) {
        const result: { message?: string } = await response.json();
        setError(result.message ?? "Work item could not be deleted.");
        return;
      }
      router.push("/work-items?message=deleted");
      router.refresh();
    } catch {
      setError("Work item could not be deleted. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return confirming ? (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm">
      <p className="font-medium text-red-900">Delete “{title}”?</p>
      <p className="mt-1 text-red-800">This cannot be undone.</p>
      {error && <p role="alert" className="mt-2 text-red-800">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleDelete} disabled={pending} className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800 disabled:opacity-60">{pending ? "Deleting…" : "Yes, delete"}</button>
        <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700">Cancel</button>
      </div>
    </div>
  ) : (
    <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${title}`} className="text-sm font-medium text-red-700 underline-offset-2 hover:underline">Delete</button>
  );
}
