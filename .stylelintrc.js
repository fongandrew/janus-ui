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
			// The whole v2 CSS library authors its own design tokens, variant palettes,
			// component chrome, and tool mixins — the v1-era "prefer tool mixins" guards
			// (which existed for v1's --v-animation-none transition wrapper) don't apply.
			// v2 transitions/animations derive from --v-duration, which zeroes itself under
			// prefers-reduced-motion, so a plain `transition`/`animation` is already safe.
			// The doc-site application CSS (v2-site) is a consumer, not library code.
			files: ['src/lib2/css/**/*.css', 'src/v2-site/**/*.css'],
			rules: {
				'declaration-property-value-disallowed-list': null,
				'declaration-property-value-allowed-list': null,
			},
		},
	],
};
