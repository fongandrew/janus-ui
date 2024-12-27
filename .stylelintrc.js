/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
	rules: {
		'import-notation': null,
		'selector-class-pattern': null,
		'custom-property-pattern': null,
		'declaration-block-no-redundant-longhand-properties': null,
		'property-no-vendor-prefix': null,
		'value-no-vendor-prefix': null,
		// Tailwind media queries not handled here
		'media-query-no-invalid': null,
	},
};
