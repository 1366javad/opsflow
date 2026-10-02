export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-7">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </header>
  );
}
