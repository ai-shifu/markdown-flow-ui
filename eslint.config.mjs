// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import prettier from "eslint-plugin-prettier/recommended";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// Preserve the existing hooks policy until React Compiler is enabled.
const compilerRules = Object.fromEntries(
  nextVitals
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .filter(
      (rule) =>
        rule.startsWith("react-hooks/") &&
        rule !== "react-hooks/rules-of-hooks" &&
        rule !== "react-hooks/exhaustive-deps"
    )
    .map((rule) => [rule, "off"])
);

const eslintConfig = [
  {
    ignores: ["src/components/ContentRender/vendor/**"],
  },
  ...nextVitals,
  ...nextTypeScript,
  ...storybook.configs["flat/recommended"],
  prettier,
  {
    rules: {
      ...compilerRules,
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
      // Disable React hook dependencies rule
      "react-hooks/exhaustive-deps": "off",
      // Allow console statements during development
      "no-console": "off",
    },
  },
];

export default eslintConfig;
