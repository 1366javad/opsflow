import Link from "next/link";
import { signOut } from "@/auth";
import type { AuthenticatedUser } from "@/types/domain";
import { Navigation } from "./navigation";

type AppShellProps = { user: AuthenticatedUser; children: React.ReactNode };

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <Link href="/" className="text-lg font-semibold tracking-tight">OpsFlow</Link>
        </div>
        <Navigation />
        <div className="border-t border-slate-200 px-5 py-3 lg:mt-auto lg:px-5 lg:py-5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <p className="mt-2 text-xs font-semibold text-slate-600">{user.role}</p>
          <form action={signOutAction}>
            <button type="submit" className="mt-4 text-sm font-medium text-slate-600 hover:text-slate-950">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
