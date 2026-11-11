import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Browser code must not pull server modules (secrets, validation library, logger) into the bundle.
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*-form.tsx"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/server/*"], message: "Client code must not import server modules." }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // Output of the Netlify CLI (local builds and deploys).
    ".netlify/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
