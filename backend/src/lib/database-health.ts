import { getPrismaClient } from "./prisma.js";

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error";
    console.error(
      JSON.stringify({
        event: "database_health_check_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
        errorCode:
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : undefined,
        errorMessage: errorMessage.replace(/postgres(?:ql)?:\/\/\S+/gi, "<redacted>")
      }),
    );
    return false;
  }
}
