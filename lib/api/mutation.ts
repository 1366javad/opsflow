import "server-only";

import { ZodError, type ZodType } from "zod";

import { WorkItemError } from "@/features/work-items/errors";
import { AuthorizationError } from "@/lib/auth/authorization";

export class RequestError extends Error {
  constructor(message: string, public readonly status: 400 | 403 | 415) {
    super(message);
    this.name = "RequestError";
  }
}

export async function parseMutationJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new RequestError("Request origin is not allowed.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new RequestError("Send JSON content.", 415);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RequestError("Invalid JSON body.", 400);
  }
  return schema.parse(body);
}

export function requireMutationOrigin(request: Request): void {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new RequestError("Request origin is not allowed.", 403);
  }
}

export function mutationErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ message: "Check the highlighted fields.", fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }
  if (error instanceof AuthorizationError || error instanceof WorkItemError || error instanceof RequestError) {
    return Response.json({ message: error.message }, { status: error.status });
  }
  console.error("Work item mutation failed:", error);
  return Response.json({ message: "The operation could not be completed. Please try again." }, { status: 500 });
}
