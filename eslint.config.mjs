import { defineConfig } from 'eslint/config';
import tseslint from '@electron-toolkit/eslint-config-ts';
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import * as pluginImport from 'eslint-plugin-import-x';

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/order': [
        'error',
        {
          groups: [
            'type', // 1. 类型导入
            'builtin', // 内置模块 (如 'path', 'fs')
            'external', // 外部模块 (如 'vue', 'axios')
            'internal', // 内部模块 (如 '../types', './utils')
            ['parent', 'sibling', 'index'], // 4. 父级、兄弟级、index导入
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintConfigPrettier,
);
