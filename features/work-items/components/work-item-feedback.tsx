const messages: Record<string, string> = {
  created: "Work item created.",
  updated: "Work item updated.",
  deleted: "Work item deleted.",
};

export function WorkItemFeedback({ message }: { message?: string }) {
  const text = message ? messages[message] : undefined;
  return text ? <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{text}</p> : null;
}
