import {
  apiErrorResponseSchema,
  authResponseSchema,
  type AuthUser,
  type LoginInput,
  type RegistrationInput,
} from "./auth-contract";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  parse: (value: unknown) => T,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api/auth${path}`, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Unable to connect. Please try again.",
      0,
    );
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = apiErrorResponseSchema.safeParse(body);
    throw new ApiError(
      parsedError.success ? parsedError.data.error.code : "REQUEST_FAILED",
      parsedError.success
        ? parsedError.data.error.message
        : "An unexpected error occurred",
      response.status,
    );
  }

  return parse(body);
}

function parseUser(body: unknown): AuthUser {
  const parsed = authResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      "INVALID_RESPONSE",
      "The server returned an invalid response",
      502,
    );
  }
  return parsed.data.data.user;
}

export function login(input: LoginInput): Promise<AuthUser> {
  return request("/login", { method: "POST", body: JSON.stringify(input) }, parseUser);
}

export function register(input: RegistrationInput): Promise<AuthUser> {
  return request(
    "/register",
    { method: "POST", body: JSON.stringify(input) },
    parseUser,
  );
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new ApiError("LOGOUT_FAILED", "Unable to log out", response.status);
  }
}
