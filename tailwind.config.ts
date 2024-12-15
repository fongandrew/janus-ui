import tailwindCSSTypography from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';
import tailwindCSSAnimate from 'tailwindcss-animate';

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
		colors: {
			transparent: 'transparent',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
				DEFAULT: 'hsl(var(--card))',
				fg: 'hsl(var(--card-fg))',
			},
			code: {
				background: 'hsl(var(--code-bg))',
				fg: 'hsl(var(--code-fg))',
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				fg: 'hsl(var(--popover-fg))',
			},
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				fg: 'hsl(var(--primary-fg))',
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				fg: 'hsl(var(--secondary-fg))',
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				fg: 'hsl(var(--muted-fg))',
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				fg: 'hsl(var(--accent-fg))',
			},
			danger: {
				DEFAULT: 'hsl(var(--danger))',
				fg: 'hsl(var(--danger-fg))',
			},
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
		},

		borderRadius: {
			'0': '0',
			sm: pxToRem(px.borderRadius.sm),
			md: pxToRem(px.borderRadius.md),
			lg: pxToRem(px.borderRadius.lg),
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

		ringWidth: {
			'0': '0',
			DEFAULT: pxToRem(2),
		},

		ringOffsetWidth: {
			'0': '0',
			DEFAULT: pxToRem(2),
		},

		ringOpacity: {
			'0': '0',
			DEFAULT: '1',
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

			// These are useful as a way to get an element to the sought after
			// height in the one-line case while still leaving it flexible
			// if more lines show up
			'input-pad-sm': pxToRem((px.height.input.sm - px.lineHeight.sm) / 2),
			'input-pad-md': pxToRem((px.height.input.md - px.lineHeight.md) / 2),
			'input-pad-lg': pxToRem((px.height.input.lg - px.lineHeight.lg) / 2),
		},

		textUnderlineOffset: {
			DEFAULT: '1rem',
		},

		extend: {
			contrast: {
				hover: '.95',
			},

			height: {
				// Input sizes
				'input-sm': pxToRem(px.height.input.sm),
				'input-md': pxToRem(px.height.input.md),
				'input-lg': pxToRem(px.height.input.lg),
			},

			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'hsl(var(--foreground))',
						'--tw-prose-headings': 'hsl(var(--foreground))',
						'--tw-prose-links': 'hsl(var(--primary))',
						'--tw-prose-bold': 'hsl(var(--foreground))',
						'--tw-prose-counters': 'hsl(var(--muted-fg))',
						'--tw-prose-bullets': 'hsl(var(--muted-fg))',
						'--tw-prose-hr': 'hsl(var(--border))',
						'--tw-prose-quotes': 'hsl(var(--foreground))',
						'--tw-prose-quote-borders': 'hsl(var(--border))',
						'--tw-prose-captions': 'hsl(var(--muted-fg))',
						'--tw-prose-code': 'hsl(var(--foreground))',
						'--tw-prose-pre-code': 'hsl(var(--code-fg))',
						'--tw-prose-pre-bg': 'hsl(var(--code-bg))',
						'--tw-prose-th-borders': 'hsl(var(--border))',
						'--tw-prose-td-borders': 'hsl(var(--border))',
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
	plugins: [tailwindCSSAnimate, tailwindCSSTypography],
} satisfies Config;
