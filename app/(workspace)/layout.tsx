import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AuthorizationError, requireAuthenticatedUser } from "@/lib/auth/authorization";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) redirect("/login");
    throw error;
  }
  return <AppShell user={user}>{children}</AppShell>;
}
