import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Architecture rule: Prisma is only reachable through the repository layer.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/repositories/**", "src/server/db/**", "src/generated/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/db/*", "@/generated/prisma/*", "@prisma/*"],
              message: "Only repositories may talk to Prisma. Go through a service/repository.",
            },
          ],
        },
      ],
    },
  },
  {
    // Route Handlers call services, never repositories.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/server/db/*",
                "@/generated/prisma/*",
                "@prisma/*",
                "@/server/repositories/*",
              ],
              message: "Route Handlers and pages must go through a service.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
