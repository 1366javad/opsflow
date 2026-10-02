import Link from "next/link";

export default function WorkItemNotFound() {
  return <div className="rounded-xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-semibold text-slate-900">Work item not found</h1><p className="mt-2 text-sm text-slate-600">This work item may have been removed.</p><Link href="/work-items" className="mt-5 inline-block text-sm font-medium text-slate-900 underline">Return to Work Items</Link></div>;
}
