import type { ZodType } from "zod";

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

type ApiErrorPayload = { code: string; message: string };

const errorShape = {
  parse(value: unknown): ApiErrorPayload | null {
    if (
      typeof value === "object" &&
      value !== null &&
      "error" in value &&
      typeof value.error === "object" &&
      value.error !== null &&
      "code" in value.error &&
      "message" in value.error &&
      typeof value.error.code === "string" &&
      typeof value.error.message === "string"
    ) {
      return { code: value.error.code, message: value.error.message };
    }
    return null;
  },
};

async function execute(url: string, options: RequestInit) {
  try {
    return await fetch(url, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
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
}

async function throwResponseError(response: Response, body: unknown) {
  const error = errorShape.parse(body);
  throw new ApiError(
    error?.code ?? "REQUEST_FAILED",
    error?.message ?? "An unexpected error occurred",
    response.status,
  );
}

export async function requestJson<T>(
  url: string,
  options: RequestInit,
  schema: ZodType<T>,
): Promise<T> {
  const response = await execute(url, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) await throwResponseError(response, body);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(
      "INVALID_RESPONSE",
      "The server returned an invalid response",
      502,
    );
  }
  return parsed.data;
}

export async function requestEmpty(
  url: string,
  options: RequestInit,
): Promise<void> {
  const response = await execute(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    await throwResponseError(response, body);
  }
}
