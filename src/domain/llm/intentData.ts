import { z } from 'zod';

export const IntentDataSchema = z.object({
    intention: z.enum([
      "general_chat",
      "analyze_issues_priority", 
      "analyze_complexity",
      "login_github",
      "find_repo"
    ]),
    args: z.record(z.string(), z.any()).default({}) 
  });

export type IntentData = z.infer<typeof IntentDataSchema>;