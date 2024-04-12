import js from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '_', caughtErrorsIgnorePattern: '_' }],
      'no-var': ['error'],
      'prefer-const': ['error'],
      'no-undef': ['off'],
      'no-console': ['error'],
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.flat.recommended,
  {
    rules: {
      'mocha/no-setup-in-describe': ['off'],
      'mocha/no-exclusive-tests': ['error'],
      'mocha/no-pending-tests': ['error'],
      'mocha/no-skipped-tests': ['error'],
      'mocha/no-hooks-for-single-case': ['off'],
      'mocha/no-top-level-hooks': ['error'],
      'mocha/no-global-tests': ['off'],
    },
  },
];
