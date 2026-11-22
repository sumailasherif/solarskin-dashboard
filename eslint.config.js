// ESLint finds likely bugs and bad patterns in our code.
// This one file configures it for every package in the monorepo.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Folders ESLint should never look at
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'firmware/**'] },

  // Recommended rules for JavaScript and TypeScript
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Node.js code (backend, simulator, shared, config files)
  {
    files: ['backend/**/*.ts', 'simulator/**/*.ts', 'shared/**/*.ts', '*.js'],
    languageOptions: { globals: globals.node },
  },

  // React code (frontend)
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Turn off style rules that Prettier already handles (must be last)
  prettier,
);
