/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
	plugins: ['stylelint-value-no-unknown-custom-properties'],
	rules: {
		// So we can import without URL notation
		'import-notation': null,
		// This doesn't like BEM
		'selector-class-pattern': null,
		// Doesn't play nice with breakpoint vars
		'media-query-no-invalid': null,
		// Allow more flexibility with custom property names (e.g. BEM-ish names)
		'custom-property-pattern': null,
		// BEM-ish keyframe names
		'keyframes-name-pattern': null,

		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['define-mixin', 'mixin'],
			},
		],

		'csstools/value-no-unknown-custom-properties': [
			true,
			{
				importFrom: [
					'src/lib/styles/variables/index.css',
					// v2 token layer — the source of truth for every --v-* / --o-* default.
					'src/lib2/css/tokens/index.css',
				],
			},
		],
	},
	overrides: [
		{
			files: ['!**/variables/**/*.css'],
			rules: {
				'declaration-property-value-disallowed-list': [
					{
						color: [/var\(--v-muted/, /var\(--v-danger-text/],
						'font-weight': [/var\(/],
					},
					{ message: 'Prefer tool mixins' },
				],
			},
		},
		{
			files: ['!**/tools/**/*.css'],
			rules: {
				'declaration-property-value-allowed-list': [
					{
						animation: ['none'],
						transition: ['none'],
					},
					{ message: 'Prefer tool mixins' },
				],
			},
		},
		{
			// v2 token-authoring files are the v2 equivalent of v1's variables/ — they
			// legitimately set font-weight/animation from knobs inside their mixins.
			// The doc-site application CSS (v2-site) is a consumer, not library code,
			// so the "prefer tool mixins" guidance doesn't apply to it either.
			files: ['src/lib2/css/tokens/**/*.css', 'src/v2-site/**/*.css'],
			rules: {
				'declaration-property-value-disallowed-list': null,
				'declaration-property-value-allowed-list': null,
			},
		},
	],
};
