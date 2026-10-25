// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-plugin-prettier/recommended";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: ["src/components/ContentRender/vendor/**"],
  },
  ...nextVitals,
  ...nextTypescript,
  ...storybook.configs["flat/recommended"],
  prettier,
  {
    rules: {
      "prettier/prettier": "error",
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Allow 'any' type in specific cases during development
      "@typescript-eslint/no-explicit-any": "warn",
      // Preserve the existing lint policy during the dependency upgrade.
      // Compiler-readiness changes require a separate review of component behavior.
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      // Disable React hook dependencies rule
      "react-hooks/exhaustive-deps": "off",
      // Allow console statements during development
      "no-console": "off",
    },
  },
];

export default eslintConfig;
