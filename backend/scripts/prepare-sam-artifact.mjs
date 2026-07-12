import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const artifactRoot = resolve(".aws-sam", "build", "ApiFunction");
const artifactNodeModules = resolve(artifactRoot, "node_modules");
const generatedClientSource = resolve("node_modules", ".prisma", "client");
const generatedClientTarget = resolve(artifactNodeModules, ".prisma", "client");
const prismaClientSource = resolve("node_modules", "@prisma", "client");
const prismaClientTarget = resolve(artifactNodeModules, "@prisma", "client");
const compilerTarget = resolve(generatedClientTarget, "query_compiler_bg.wasm");

if (!existsSync(resolve(artifactRoot, "handler.js"))) {
  throw new Error("SAM artifact is missing handler.js");
}

if (!existsSync(resolve(generatedClientSource, "query_compiler_bg.wasm"))) {
  throw new Error("Prisma Client is not generated");
}

mkdirSync(artifactNodeModules, { recursive: true });
cpSync(generatedClientSource, generatedClientTarget, { recursive: true });
cpSync(prismaClientSource, prismaClientTarget, { recursive: true });

if (!existsSync(compilerTarget)) {
  throw new Error("SAM artifact is missing Prisma query compiler");
}

console.log("Prisma runtime copied to SAM artifact");
