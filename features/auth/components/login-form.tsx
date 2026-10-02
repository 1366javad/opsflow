"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/features/auth/actions/login";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200" />
      </div>
      {state.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
