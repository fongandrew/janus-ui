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
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))',
			},
			code: {
				background: 'hsl(var(--code-background))',
				foreground: 'hsl(var(--code-foreground))',
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))',
			},
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))',
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))',
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))',
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))',
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))',
			},
			border: 'hsl(var(--border))',
			ring: 'hsl(var(--ring))',
		},

		borderRadius: {
			sm: '0.25rem',
			md: '0.375rem',
			lg: '0.5rem',
		},

		borderWidth: {
			sm: '1px',
			md: '0.25rem',
			lg: '0.5rem',
		},

		fontSize: {
			xs: ['0.8125rem', { lineHeight: '1.125rem' }],
			sm: ['0.875rem', { lineHeight: '1.25rem' }],
			md: ['1rem', { lineHeight: '1.5rem' }],
			lg: ['1.125rem', { lineHeight: '1.75rem' }],
			xl: ['1.25rem', { lineHeight: '1.75rem' }],
			'2xl': ['1.5rem', { lineHeight: '2rem' }],

			// Alias for md
			base: ['1rem', { lineHeight: '1.5rem' }],

			// Identical to normal t-shirt sizes for now but separate
			// in case we want to tweak them independently
			'input-sm': ['0.875rem', { lineHeight: '1.25rem' }],
			'input-md': ['1rem', { lineHeight: '1.5rem' }],
			'input-lg': ['1.125rem', { lineHeight: '1.75rem' }],
		},

		height: {
			'input-sm': '2rem',
			'input-md': '2.25rem',
			'input-lg': '3rem',
		},

		spacing: {
			// Base sizes
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
			'input-pad-sm': '0.375rem',
			'input-pad-md': '0.375rem',
			'input-pad-lg': '0.625rem',
		},

		extend: {
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'hsl(var(--foreground))',
						'--tw-prose-headings': 'hsl(var(--foreground))',
						'--tw-prose-links': 'hsl(var(--primary))',
						'--tw-prose-bold': 'hsl(var(--foreground))',
						'--tw-prose-counters': 'hsl(var(--muted-foreground))',
						'--tw-prose-bullets': 'hsl(var(--muted-foreground))',
						'--tw-prose-hr': 'hsl(var(--border))',
						'--tw-prose-quotes': 'hsl(var(--foreground))',
						'--tw-prose-quote-borders': 'hsl(var(--border))',
						'--tw-prose-captions': 'hsl(var(--muted-foreground))',
						'--tw-prose-code': 'hsl(var(--foreground))',
						'--tw-prose-pre-code': 'hsl(var(--code-foreground))',
						'--tw-prose-pre-bg': 'hsl(var(--code-background))',
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
