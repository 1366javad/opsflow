import { z } from "zod";

import { WorkItemStatus } from "@/generated/prisma/client";

export const statusUpdateSchema = z.strictObject({
  status: z.enum(WorkItemStatus),
});
