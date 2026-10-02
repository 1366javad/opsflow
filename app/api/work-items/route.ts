import { revalidatePath } from "next/cache";

import { createWorkItemSchema } from "@/features/work-items/schemas/work-item";
import { createWorkItem } from "@/features/work-items/services/work-items-write";
import { mutationErrorResponse, parseMutationJson } from "@/lib/api/mutation";
import { requireAdmin, requireAuthenticatedUser } from "@/lib/auth/authorization";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    requireAdmin(user);
    const input = await parseMutationJson(request, createWorkItemSchema);
    const item = await createWorkItem(user, input);
    revalidatePath("/work-items");
    revalidatePath("/dashboard");
    return Response.json({ id: item.id }, { status: 201 });
  } catch (error) {
    return mutationErrorResponse(error);
  }
}
