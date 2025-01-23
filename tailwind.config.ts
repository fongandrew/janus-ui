import tailwindCSSTypography from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';
import tailwindCSSAnimate from 'tailwindcss-animate';

import { twBorderDynamicPlugin } from './plugins/tw-border-dynamic';

// Helper to convert rems to pixels using a 16px base
const pxToRem = (px: number) => `${parseFloat((px / 16).toFixed(4))}rem`;

// Base pixel values we use to derive other stuff
const px = {
	borderRadius: {
		sm: 4,
		md: 6,
		lg: 8,
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		'2xl': 40,
	},
	fontSize: {
		xs: 13,
		sm: 14,
		md: 15,
		lg: 16,
		xl: 20,
		'2xl': 24,
		input: {
			sm: 14,
			md: 15,
			lg: 26,
		},
	},
	height: {
		input: {
			sm: 28,
			md: 32,
			lg: 36,
		},
	},
	width: {
		dropdown: 184,
		modal: 512,
		tooltip: 240,
	},
	lineHeight: {
		xs: 18,
		sm: 20,
		md: 22,
		lg: 24,
		xl: 28,
		'2xl': 32,
		input: {
			sm: 14,
			md: 15,
			lg: 26,
		},
	},
} as const;

export default {
	darkMode: [
		'variant',
		[
			'@media (prefers-color-scheme: dark) { &:not([data-color-scheme="light"] *) }',
			'&:is([data-color-scheme="dark"] *)',
		],
	],
	content: ['.src/**/*.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		boxShadow: {
			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
			none: '0 0 #0000',
			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
			md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
			lg: '0 6px 9px -2px rgb(0 0 0 / 0.05), 0 3px 5px -3px rgb(0 0 0 / 0.05)',
			xl: '0 12px 18px -4px rgb(0 0 0 / 0.05)',
			inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
			innerTop: 'inset 0 2px 3px 0 rgb(0 0 0 / 0.1)',
			innerBottom: 'inset 0 -2px 3px 0 rgb(0 0 0 / 0.1)',
			innerBorder: 'inset 0 0 0px 1px rgb(0 0 0 / 0.2)',
		},

		colors: {
			transparent: 'transparent',
			background: 'var(--background)',
			foreground: 'var(--foreground)',
			card: {
				DEFAULT: 'var(--card)',
				fg: 'var(--card-fg)',
			},
			code: {
				background: 'var(--code-bg)',
				fg: 'var(--code-fg)',
			},
			popover: {
				DEFAULT: 'var(--popover)',
				fg: 'var(--popover-fg)',
			},
			tooltip: {
				DEFAULT: 'var(--tooltip)',
				fg: 'var(--tooltip-fg)',
			},
			primary: {
				DEFAULT: 'var(--primary)',
				fg: 'var(--primary-fg)',
			},
			secondary: {
				DEFAULT: 'var(--secondary)',
				fg: 'var(--secondary-fg)',
			},
			highlight: {
				DEFAULT: 'var(--highlight)',
				fg: 'var(--highlight-fg)',
			},
			callout: {
				DEFAULT: 'var(--callout)',
				fg: 'var(--callout-fg)',
			},
			danger: {
				DEFAULT: 'var(--danger)',
				fg: 'var(--danger-fg)',
			},
			input: {
				bg: 'var(--input-bg)',
				fg: 'var(--input-fg)',
				disabled: 'var(--input-disabled-bg)',
			},
			backdrop: 'var(--backdrop)',
			muted: 'var(--muted)',
			link: 'var(--link)',
			border: 'var(--border)',
			ring: 'var(--ring)',
		},

		borderDynamic: {
			base: 'var(--border-dynamic-base)',
			mix: 'var(--border-dynamic-mix)',
		},

		borderRadius: {
			'0': '0',
			sm: pxToRem(px.borderRadius.sm),
			md: pxToRem(px.borderRadius.md),
			lg: pxToRem(px.borderRadius.lg),
			full: '9999px',
		},

		borderWidth: {
			'0': '0',
			sm: '1px', // Separate px value so it's always smallest regardless of rem
			md: pxToRem(1),
			lg: pxToRem(2),
		},

		fontSize: {
			xs: [pxToRem(px.fontSize.xs), { lineHeight: pxToRem(px.lineHeight.xs) }],
			sm: [pxToRem(px.fontSize.sm), { lineHeight: pxToRem(px.lineHeight.sm) }],
			md: [pxToRem(px.fontSize.md), { lineHeight: pxToRem(px.lineHeight.md) }],
			lg: [pxToRem(px.fontSize.lg), { lineHeight: pxToRem(px.lineHeight.lg) }],
			xl: [pxToRem(px.fontSize.xl), { lineHeight: pxToRem(px.lineHeight.xl) }],
			'2xl': [pxToRem(px.fontSize['2xl']), { lineHeight: pxToRem(px.lineHeight['2xl']) }],

			// Alias for md
			base: [pxToRem(px.fontSize.md), { lineHeight: pxToRem(px.lineHeight.md) }],

			// Identical to normal t-shirt sizes for now but separate
			// in case we want to tweak them independently
			'input-sm': [pxToRem(px.fontSize.sm), { lineHeight: pxToRem(px.lineHeight.sm) }],
			'input-md': [pxToRem(px.fontSize.md), { lineHeight: pxToRem(px.lineHeight.md) }],
			'input-lg': [pxToRem(px.fontSize.lg), { lineHeight: pxToRem(px.lineHeight.lg) }],
		},

		// No ring, prefer outlien
		ringWidth: {
			'0': '0',
		},
		ringOffsetWidth: {
			'0': '0',
		},
		ringOpacity: {
			'0': '0',
		},

		outlineWidth: {
			'0': '0',
			DEFAULT: pxToRem(2),
		},
		outlineOffset: {
			'0': '0',
			DEFAULT: pxToRem(2),
		},

		spacing: {
			// Base sizes
			'0': '0',
			xs: pxToRem(px.spacing.xs),
			sm: pxToRem(px.spacing.sm),
			md: pxToRem(px.spacing.md),
			lg: pxToRem(px.spacing.lg),
			xl: pxToRem(px.spacing.xl),
			'2xl': pxToRem(px.spacing['2xl']),

			// Some useful values that we don't want to have to use arbitrary value
			// notation for
			em: '1em',
			lh: '1lh',
		},

		textUnderlineOffset: {
			DEFAULT: '0.25rem',
		},

		zIndex: {
			auto: 'auto',

			// Basic z-indicies for generic relative positioning (if needed)
			'0': '0',
			'1': '1',

			// Overlay or backdrop needs a z-index since it generally doesn't go in the
			// top-layer itself used by modals or popover (we could but the one we use
			// is manually generated via the :after pseudo-elements on the body and modals
			// to block click thoughts -- the native :backdrop pseudo-element doesn't let
			// us do that.
			backdrop: '10',

			// Anything above a backdrop -- it isn't necessary for native popovers
			// and modals that go in the top layer, but we sometimes elevate certain
			// non-top-layer elements above the backdrop (like the input box for a
			// typeahead select)
			'above-backdrop': '20',
		},

		extend: {
			contrast: {
				hover: '.95',
			},

			saturate: {
				hover: '1.15',
			},

			height: {
				// Input sizes
				'input-sm': pxToRem(px.height.input.sm),
				'input-md': pxToRem(px.height.input.md),
				'input-lg': pxToRem(px.height.input.lg),
			},

			minHeight: {
				// Input sizes
				'input-sm': pxToRem(px.height.input.sm),
				'input-md': pxToRem(px.height.input.md),
				'input-lg': pxToRem(px.height.input.lg),
			},

			maxHeight: {
				// Input sizes
				'input-sm': pxToRem(px.height.input.sm),
				'input-md': pxToRem(px.height.input.md),
				'input-lg': pxToRem(px.height.input.lg),
			},

			padding: {
				// These are useful as a way to get an even vertical padding that
				// accounts for text line height
				'text-y-xs': pxToRem(px.spacing.xs - (px.lineHeight.xs - px.fontSize.xs) / 2),
				'text-y-sm': pxToRem(px.spacing.sm - (px.lineHeight.sm - px.fontSize.sm) / 2),
				'text-y-md': pxToRem(px.spacing.md - (px.lineHeight.md - px.fontSize.md) / 2),
				'text-y-lg': pxToRem(px.spacing.lg - (px.lineHeight.lg - px.fontSize.lg) / 2),
				'text-y-xl': pxToRem(px.spacing.xl - (px.lineHeight.xl - px.fontSize.xl) / 2),
				'text-y-2xl': pxToRem(
					px.spacing['2xl'] - (px.lineHeight['2xl'] - px.fontSize['2xl']) / 2,
				),

				// These are useful as a way to get an element to the sought after
				// height in the one-line case while still leaving it flexible
				// if more lines show up
				'input-y-sm': pxToRem((px.height.input.sm - px.lineHeight.sm) / 2),
				'input-y-md': pxToRem((px.height.input.md - px.lineHeight.md) / 2),
				'input-y-lg': pxToRem((px.height.input.lg - px.lineHeight.lg) / 2),

				// Corresponding horizontal padding for the above
				'input-x-sm': pxToRem((px.height.input.sm - px.fontSize.sm) / 2),
				'input-x-md': pxToRem((px.height.input.md - px.fontSize.md) / 2),
				'input-x-lg': pxToRem((px.height.input.lg - px.fontSize.lg) / 2),
			},

			size: {
				// Tooltip arrow size
				'tooltip-arrow': 'var(--tooltip-arrow-size)',
			},

			maxWidth: {
				tooltip: pxToRem(px.width.tooltip),
			},

			minWidth: {
				dropdown: pxToRem(px.width.dropdown),
			},

			width: {
				// Component sizes
				'input-sm': pxToRem(px.height.input.sm),
				'input-md': pxToRem(px.height.input.md),
				'input-lg': pxToRem(px.height.input.lg),
				modal: pxToRem(px.width.modal),
			},

			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'var(--foreground)',
						'--tw-prose-headings': 'var(--foreground)',
						'--tw-prose-links': 'var(--primary)',
						'--tw-prose-bold': 'var(--foreground)',
						'--tw-prose-counters': 'var(--muted)',
						'--tw-prose-bullets': 'var(--muted)',
						'--tw-prose-hr': 'var(--border)',
						'--tw-prose-quotes': 'var(--foreground)',
						'--tw-prose-quote-borders': 'var(--border)',
						'--tw-prose-captions': 'var(--muted)',
						'--tw-prose-code': 'var(--foreground)',
						'--tw-prose-pre-code': 'var(--code-fg)',
						'--tw-prose-pre-bg': 'var(--code-bg)',
						'--tw-prose-th-borders': 'var(--border)',
						'--tw-prose-td-borders': 'var(--border)',
						// Customize paragraph spacing
						'p + p': {
							marginTop: '0.75em',
						},
						// Remove backticks from inline code
						'code::before': {
							content: 'none',
						},
						'code::after': {
							content: 'none',
						},
						// Adjust line height
						lineHeight: '1.5',
						p: {
							lineHeight: '1.5',
						},
						// List styles
						'ul, ol': {
							margin: '0',
						},
						li: {
							lineHeight: '1.5',
							margin: '0',
							padding: '0',
						},
						'li + li': {
							marginTop: '0.25em',
						},
						// Heading spacing
						h1: {
							marginTop: '0',
							marginBottom: '0.5em',
						},
						h2: {
							marginTop: '0.75em',
							marginBottom: '0.5em',
						},
						h3: {
							marginTop: '0.75em',
							marginBottom: '0.5em',
						},
						'h1 + h2': {
							marginTop: '0.5em',
						},
						'h2 + h3': {
							marginTop: '0.5em',
						},
					},
				},
			},
		},
	},
	plugins: [tailwindCSSAnimate, tailwindCSSTypography, twBorderDynamicPlugin],
} satisfies Config;
