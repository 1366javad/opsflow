import { revalidatePath } from "next/cache";

import { editWorkItemSchema } from "@/features/work-items/schemas/work-item";
import { deleteWorkItem, editWorkItem } from "@/features/work-items/services/work-items-write";
import { mutationErrorResponse, parseMutationJson, requireMutationOrigin } from "@/lib/api/mutation";
import { requireAdmin, requireAuthenticatedUser } from "@/lib/auth/authorization";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireAuthenticatedUser();
    requireAdmin(user);
    const { id } = await context.params;
    const input = await parseMutationJson(request, editWorkItemSchema);
    await editWorkItem(user, id, input);
    revalidatePath("/work-items");
    revalidatePath(`/work-items/${id}`);
    revalidatePath("/dashboard");
    return Response.json({ id });
  } catch (error) {
    return mutationErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireAuthenticatedUser();
    requireAdmin(user);
    requireMutationOrigin(request);
    const { id } = await context.params;
    await deleteWorkItem(user, id);
    revalidatePath("/work-items");
    revalidatePath(`/work-items/${id}`);
    revalidatePath("/dashboard");
    return new Response(null, { status: 204 });
  } catch (error) {
    return mutationErrorResponse(error);
  }
}
