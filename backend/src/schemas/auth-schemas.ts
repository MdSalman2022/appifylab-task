import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(12).max(128),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().default(false),
});
