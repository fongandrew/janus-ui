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
				importFrom: ['src/shared/styles/variables/index.css'],
			},
		],
	},
	overrides: [
		{
			files: ['!**/tools/**/*.css'],
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
	],
};
