import tailwindCSSTypography from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';
import tailwindCSSAnimate from 'tailwindcss-animate';

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
			sm: '0.25rem',
			md: '0.375rem',
			lg: '0.5rem',
		},

		borderWidth: {
			'0': '0',
			sm: '1px',
			md: '0.0625rem',
			lg: '0.125rem',
		},

		fontSize: {
			xs: ['0.8125rem', { lineHeight: '1.125rem' }], // 13/18px
			sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14/20px
			md: ['0.9375rem', { lineHeight: '1.375rem' }], // 15/22px
			lg: ['1rem', { lineHeight: '1.5rem' }], // 16/24px
			xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20/28px
			'2xl': ['1.5rem', { lineHeight: '2rem' }], // 24/32px

			// Alias for md
			base: ['1rem', { lineHeight: '1.5rem' }],

			// Identical to normal t-shirt sizes for now but separate
			// in case we want to tweak them independently
			'input-sm': ['0.875rem', { lineHeight: '1.25rem' }],
			'input-md': ['0.9375rem', { lineHeight: '1.375rem' }],
			'input-lg': ['1.5rem', { lineHeight: '1.5rem' }],
		},

		height: {
			'input-sm': '1.75rem',
			'input-md': '2rem',
			'input-lg': '2.25rem',
		},

		ringWidth: {
			'0': '0',
			DEFAULT: '0.125rem',
		},

		ringOffsetWidth: {
			'0': '0',
			DEFAULT: '0.125rem',
		},

		ringOpacity: {
			'0': '0',
			DEFAULT: '1',
		},

		spacing: {
			// Base sizes
			'0': '0',
			xs: '0.25rem',
			sm: '0.5rem',
			md: '1rem',
			lg: '1.5rem',
			xl: '2rem',
			'2xl': '2.5rem',

			// Calculated as (input height - corresponding line height) / 2
			// These are useful as a way to get an element to the sought after
			// height in the one-line case while still leaving it flexible
			// if more lines show up
			'input-pad-sm': '0.25rem',
			'input-pad-md': '0.3125rem',
			'input-pad-lg': '0.375rem',
		},

		textUnderlineOffset: {
			DEFAULT: '1rem',
		},

		extend: {
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
