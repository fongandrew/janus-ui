/**
 * Shared prop→class maps (§13.7). Literal class strings so the
 * css-class-usage lint can verify every emitted class exists in css/.
 */

export type Variant = 'primary' | 'danger' | 'success' | 'warn' | 'info' | 'secondary';

const VARIANT_CLASSES: Record<Variant, string> = {
	primary: 'v-colors-primary',
	danger: 'v-colors-danger',
	success: 'v-colors-success',
	warn: 'v-colors-warn',
	info: 'v-colors-info',
	secondary: 'v-colors-secondary',
};

export function variantClass(variant: Variant | undefined): string | undefined {
	return variant ? VARIANT_CLASSES[variant] : undefined;
}

export type Surface = 'card' | 'elevated' | 'sunken' | 'glass' | 'gradient';

const SURFACE_CLASSES: Record<Surface, string> = {
	card: 'v-surface-card',
	elevated: 'v-surface-elevated',
	sunken: 'v-surface-sunken',
	glass: 'v-surface-glass',
	gradient: 'v-surface-gradient',
};

export function surfaceClass(surface: Surface | undefined): string | undefined {
	return surface ? SURFACE_CLASSES[surface] : undefined;
}
