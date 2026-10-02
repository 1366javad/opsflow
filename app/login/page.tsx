import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { AuthorizationError, requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function LoginPage() {
  try {
    await requireAuthenticatedUser();
    redirect("/");
  } catch (error) {
    if (!(error instanceof AuthorizationError && error.status === 401)) throw error;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-slate-500">OpsFlow</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to your workspace.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
