import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Overly strict for data-fetch-on-mount, sessionStorage read, and cart hydration; safe patterns here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
]);
