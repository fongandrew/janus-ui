/** Shared `variant`/`surface` prop -> `v-colors-*` / `v-surface-*` class mapping (§7), used by every toned component. */

export type ColorVariant = 'primary' | 'danger' | 'success' | 'warn' | 'info' | 'secondary';

export function colorsClass(variant?: ColorVariant | undefined): string | undefined {
	return variant ? `v-colors-${variant}` : undefined;
}

export type SurfaceVariant = 'card' | 'elevated' | 'sunken' | 'glass' | 'gradient';

export function surfaceClass(surface?: SurfaceVariant | undefined): string | undefined {
	return surface ? `v-surface-${surface}` : undefined;
}
