import eslint from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import asyncEventPlugin from 'eslint-plugin-async-event';
import cssClassUsagePlugin from 'eslint-plugin-css-class-usage';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import solid from 'eslint-plugin-solid';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/**/*', 'node_modules/**/*', '.*/**/*'],
	},

	eslint.configs.recommended,
	{
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},

	// TypeScript configs
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},
	tseslint.configs.recommended,
	tseslint.configs.stylistic,

	// Ye-olde plugins
	eslintConfigPrettier,
	solid.configs['flat/typescript'],
	{
		ignores: ['**/test-utils/**', '**/*.test.*'],
		plugins: {
			'async-event': asyncEventPlugin,
			'css-class-usage': cssClassUsagePlugin,
		},
		rules: {
			'css-class-usage/no-unknown-classes': 'error',
			'async-event/no-async-event-properties': 'error',
			'async-event/no-async-event-reference': 'error',
		},
	},

	// Test rules
	{
		files: ['**/test-utils/**', '**/*.test.*'],
		plugins: { vitest },
		rules: {
			...vitest.configs.recommended.rules,
			'vitest/consistent-test-it': 'error',
			'vitest/no-focused-tests': 'error',
			'vitest/no-identical-title': 'error',
			'no-restricted-properties': [
				'error',
				{
					object: 'screen',
					property: 'debug',
					message: "Don't commit screen.debug()",
				},
			],
		},
	},

	// Base config for all files
	{
		files: ['**/*.{js,ts,jsx,tsx,cjs,mjs}'],
		plugins: {
			'no-relative-import-paths': noRelativeImportPaths,
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			...importPlugin.flatConfigs?.recommended.plugins,
		},

		rules: {
			// TypeScript rules
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			// Redundant with '@typescript-eslint/no-unused-vars' but this has a fixer
			'unused-imports/no-unused-imports': 'error',

			// General rules
			'comma-dangle': ['error', 'always-multiline'],
			'prefer-const': [
				'error',
				{
					destructuring: 'all',
				},
			],

			// Import rules
			'import/no-cycle': ['error', { ignoreExternal: true }],
			'import/no-duplicates': 'error',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			// Prettier rules
			'prettier/prettier': 'error',
		},
	},

	// TS declaration files
	{
		files: ['**/*.d.ts'],
		rules: {
			'import/no-default-export': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},

	// Lint rules for config files
	{
		files: [
			'*.config.{js,ts}',
			'*.cjs',
			'.*.js',
			'plugins/**/*.{js,ts}',
			'scripts/**/*.{js,ts}',
		],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'comma-dangle': 'off',
		},
	},

	// src-specific rules
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
		rules: {
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allow: [{ name: ['Error', 'URL', 'URLSearchParams'], from: 'lib' }],
					allowAny: false,
					allowBoolean: true,
					allowNullish: true,
					allowNumber: true,
					allowRegExp: true,
				},
			],
			'import/no-default-export': 'error',
			'no-console': 'error',
			'no-relative-import-paths/no-relative-import-paths': [
				'error',
				{
					allowSameFolder: false,
					prefix: '~',
					rootDir: 'src',
				},
			],

			// Custom reactive functions for Solid
			'solid/reactivity': [
				'warn',
				{
					customReactiveFunctions: [
						'combineEventHandlers',
						'extendHandler',
						'onRequestClose',
						'mergeProps',
					],
				},
			],
		},
	},

	// Restrict certain window-specific globals to avoid SSR or multi-window issues
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		ignores: ['src/shared/utility/multi-view.ts', '**/test-utils/**', '**/*.test.*'],
		rules: {
			'no-restricted-globals': [
				'error',
				...['window', 'document', 'history', 'location'].map((name) => ({
					name,
					message: `Use the document-setup utility instead`,
				})),
			],
		},
	},

	// Allow console log in logging
	{
		// Logging files
		files: ['**/*logger*.{js,ts,jsx,tsx}', '**/*logging*.{js,ts,jsx,tsx}'],
		rules: {
			'no-console': 'off',
		},
	},
);
