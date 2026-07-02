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
				ignoreAtRules: ['define-mixin', 'mixin', 'mixin-content'],
			},
		],

		'csstools/value-no-unknown-custom-properties': [
			true,
			{
				importFrom: ['src/lib/styles/variables/index.css'],
			},
		],
	},
	overrides: [
		// v2 (src/lib2): custom properties are declared across the token /
		// object / component files rather than one variables index, so the
		// unknown-custom-properties check cannot see them all. The token E2E
		// tests verify every knob resolves instead. The v1 mixin-preferring
		// bans do not apply to v2 (v2 consumes tokens directly by design).
		{
			files: ['**/lib2/**/*.css', '**/lib2-site/**/*.css'],
			rules: {
				'csstools/value-no-unknown-custom-properties': null,
				'custom-property-empty-line-before': null,
			},
		},

		// v1-specific conventions (mixin-preferring bans) — scoped to src/lib.
		// Note: stylelint treats a negated glob in `files` as an OR-match, so
		// exemptions are expressed as later overrides that null the rule.
		{
			files: ['**/lib/**/*.css'],
			rules: {
				'declaration-property-value-disallowed-list': [
					{
						color: [/var\(--v-muted/, /var\(--v-danger-text/],
						'font-weight': [/var\(/],
					},
					{ message: 'Prefer tool mixins' },
				],
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
			files: ['**/lib/**/variables/**/*.css'],
			rules: {
				'declaration-property-value-disallowed-list': null,
			},
		},
		{
			files: ['**/lib/**/tools/**/*.css'],
			rules: {
				'declaration-property-value-allowed-list': null,
			},
		},
	],
};
