import eslint from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import solid from 'eslint-plugin-solid';
import tailwind from 'eslint-plugin-tailwindcss';
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
	tailwind.configs['flat/recommended'],

	// Base config for all files
	{
		files: ['**/*.{js,ts,jsx,tsx,cjs,mjs}'],
		plugins: {
			'no-relative-import-paths': noRelativeImportPaths,
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,
			...importPlugin.flatConfigs?.recommended.plugins,
		},

		rules: {
			// TypeScript rules
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

			// These are annoying -- figure them out later
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			// General rules
			'comma-dangle': ['error', 'always-multiline'],

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
		files: ['*.config.{js,ts}', '*.cjs', '.*.js', 'scripts/**/*.{js,ts}'],
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
			'@typescript-eslint/no-explicit-any': 'off',
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

			// Tailwind styling overrides
			// 'tailwindcss/no-arbitrary-value': 'warn',
			// 'tailwindcss/no-custom-classname': 'error',
		},

		// settings: {
		// 	tailwindcss: {
		// 		callees: ['classnames', 'clsx', 'cx'],
		// 		classRegex: '^class(List|Name)?$',
		// 	},
		// },
	},

	// Allow conosle log in logging
	{
		// Logging files
		files: ['src/shared/utility/logging/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'no-console': 'off',
		},
	},
);
