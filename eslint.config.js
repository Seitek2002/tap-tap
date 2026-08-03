import js from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: { perfectionist },
    // Только алфавитная сортировка. sort-imports НЕ включаем — за импорты
    // отвечает @trivago/prettier-plugin-sort-imports, два сортировщика
    // подрались бы. Всё на warn и все правила автофиксятся (eslint --fix).
    rules: {
      // Type-level: стирается при компиляции, на рантайм не влияет.
      "perfectionist/sort-interfaces": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-object-types": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-union-types": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-enums": ["warn", { type: "alphabetical" }],
      // Объекты-значения: спред служит границей сортировки, поэтому
      // { ...base, override } не переставляется. Редкий порядок-зависимый
      // объект отключается точечным // eslint-disable-next-line.
      "perfectionist/sort-objects": ["warn", { type: "alphabetical" }],
    },
  },
]);
