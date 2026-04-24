import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    }
  },

  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off'
    }
  },

  {
    name: 'app/vue-rules',
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off'
    }
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/expect-expect': 'off',
      'vitest/no-commented-out-tests': 'off',
      'vitest/no-conditional-expect': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off'
    }
  },

  skipFormatting
];
