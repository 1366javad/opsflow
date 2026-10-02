import { revalidatePath } from "next/cache";

import { statusUpdateSchema } from "@/features/work-items/schemas/status";
import { updateWorkItemStatus } from "@/features/work-items/services/work-items-write";
import { mutationErrorResponse, parseMutationJson } from "@/lib/api/mutation";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const { status } = await parseMutationJson(request, statusUpdateSchema);
    await updateWorkItemStatus(user, id, status);
    revalidatePath("/work-items");
    revalidatePath(`/work-items/${id}`);
    revalidatePath("/dashboard");
    return Response.json({ status });
  } catch (error) {
    return mutationErrorResponse(error);
  }
}
