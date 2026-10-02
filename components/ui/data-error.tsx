"use client";

export function DataError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-white px-6 py-12 text-center">
      <h2 className="text-base font-semibold text-slate-900">We couldn’t load this page</h2>
      <p className="mt-2 text-sm text-slate-600">Please try again in a moment.</p>
      <button type="button" onClick={reset} className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
        Try again
      </button>
    </div>
  );
}
