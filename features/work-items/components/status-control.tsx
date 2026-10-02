"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { WorkItemStatus } from "@/types/domain";
import { statusLabels } from "../types";

export function StatusControl({ itemId, status }: { itemId: string; status: WorkItemStatus }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>(status);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  async function handleUpdate() {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/work-items/${itemId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!response.ok) {
        const responseBody: { message?: string } = await response.json();
        setFeedback({ text: responseBody.message ?? "Status could not be updated.", error: true });
        return;
      }
      setFeedback({ text: "Status updated.", error: false });
      router.refresh();
    } catch {
      setFeedback({ text: "Status could not be updated. Please try again.", error: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Change status</h2>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label htmlFor="change-status" className="text-sm font-medium text-slate-800">Status
          <select id="change-status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="mt-1.5 block min-w-44 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" onClick={handleUpdate} disabled={pending || selectedStatus === status} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">{pending ? "Updating…" : "Update status"}</button>
      </div>
      {feedback && <p role={feedback.error ? "alert" : "status"} className={`mt-3 text-sm ${feedback.error ? "text-red-700" : "text-slate-700"}`}>{feedback.text}</p>}
    </div>
  );
}
