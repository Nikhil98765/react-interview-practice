import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactCompiler from 'eslint-plugin-react-compiler';

export default defineConfig([
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
      'react-compiler': reactCompiler,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Vite doesn't need it
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-compiler/react-compiler': 'error',
      'no-unused-vars': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  // Turns off eslint rules that conflict with prettier
  eslintConfigPrettier,
]);
