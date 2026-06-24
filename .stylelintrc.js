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
				importFrom: ['src/lib/styles/variables/index.css'],
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
		// v2 CSS pseudo-package. It declares its own `--v-*` knobs (with new
		// semantics from the v1 names) and follows its own authoring conventions.
		// Resolve unknown-custom-property checks against the v2 token entry, and
		// drop the v1-specific "prefer tool mixins" lists. Proper per-pseudo-package
		// stylelint config lands in Phase 8 (§3.4).
		{
			files: ['src/lib2/**/*.css', 'src/lib2-site/**/*.css'],
			rules: {
				// Many v2 tokens (the fluid type scale) are defined through the
				// internal v-font-step mixin, which this rule can't expand — so it
				// can't see those custom properties. Disable it for v2; the proper
				// per-pseudo-package stylelint config in Phase 8 (§3.4) handles this.
				'csstools/value-no-unknown-custom-properties': null,
				'declaration-property-value-disallowed-list': null,
				'declaration-property-value-allowed-list': null,
			},
		},
	],
};
