import z from "zod";

export interface ToolInvocatorHandler {
  handle(): Promise<ToolResponse>;
}

const successToolResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.unknown()
});

const errorToolResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  error: z.object({
    code: z.string().optional(),
    details: z.unknown().optional()
  }).optional()
});

export const toolResponseSchema = z.discriminatedUnion("status", [
  successToolResponseSchema,
  errorToolResponseSchema
]);

export type ToolResponse = z.infer<typeof toolResponseSchema>;

export const multiToolResponseSchema = z.array(toolResponseSchema);

export type MultiToolResponse = z.infer<typeof multiToolResponseSchema>;