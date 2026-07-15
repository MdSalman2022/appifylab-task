import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  avatarKey: z.string().nullable().optional(),
});

export const authResponseSchema = z.object({
  data: z.object({ user: userSchema }),
});

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type AuthUser = z.infer<typeof userSchema>;

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegistrationInput = LoginInput & {
  firstName: string;
  lastName: string;
};
