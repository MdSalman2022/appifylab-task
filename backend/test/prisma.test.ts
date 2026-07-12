import { afterEach, describe, expect, it } from "vitest";

import { getPrismaClient } from "../src/lib/prisma.js";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe("getPrismaClient", () => {
  it("fails fast with a configuration error when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;

    expect(() => getPrismaClient()).toThrow(
      "DATABASE_URL is required to connect to PostgreSQL",
    );
  });

  it("reuses one client across warm Lambda invocations", () => {
    process.env.DATABASE_URL =
      "postgresql://user:password@localhost:5432/appifylab";

    const firstClient = getPrismaClient();
    const secondClient = getPrismaClient();

    expect(secondClient).toBe(firstClient);
  });
});
