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
	eslint.configs.recommended,

	// TypeScript configs
	tseslint.configs.strictTypeCheckedOnly,
	tseslint.configs.stylisticTypeChecked,
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
	},

	// Lint rules for config files
	{
		files: ['*.js', '*.ts', '*.cjs'],
		ignores: ['src/**/*'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.node.json',
			},
			globals: {
				...globals.node,
			},
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'comma-dangle': 'off',
		},
	},

	eslintConfigPrettier,
	solid.configs['flat/typescript'],
	tailwind.configs['flat/recommended'],

	// Ignore stuff in dist
	{
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
	},

	{
		// Base config for all files
		files: ['**/*.{js,ts,jsx,tsx,cjs,mjs}'],
		plugins: {
			'no-relative-import-paths': noRelativeImportPaths,
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,

			...importPlugin.flatConfigs?.recommended.plugins,
		},
		languageOptions: {
			globals: {
				...globals.browser,
			},
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
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',

			// These are annoying -- figure them out later
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
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

			// General rules
			'comma-dangle': ['error', 'always-multiline'],
			'no-console': 'error',

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

	// Misc src file rules
	{
		files: ['src/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'import/no-default-export': 'error',
			'no-relative-import-paths/no-relative-import-paths': [
				'error',
				{
					allowSameFolder: false,
					prefix: '~',
					rootDir: 'src',
				},
			],

			// Tailwind styling overrides
			'tailwindcss/no-arbitrary-value': 'warn',
			'tailwindcss/no-custom-classname': 'error',
		},

		settings: {
			tailwindcss: {
				callees: ['classnames', 'clsx', 'cx'],
				classRegex: '^class(List|Name)?$',
			},
		},
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
