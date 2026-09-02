import { z } from 'zod';

export const environmentSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/v1'),
  VITE_API_URL: z.string().url().default('http://localhost:3001/v1')
});
export type PublicEnvironment = z.infer<typeof environmentSchema>;
