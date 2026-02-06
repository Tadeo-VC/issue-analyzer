import { z } from 'zod';

export const IntentDataSchema = z.object({
    intention: z.enum([
      "general_chat",
      "analyze_issues_complexity", 
    ]),
    args: z.record(z.string(), z.any()).default({}) 
  });

export type IntentData = z.infer<typeof IntentDataSchema>;