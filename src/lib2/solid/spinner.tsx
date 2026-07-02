/**
 * Spinner (§13.7) — `c-spinner o-square`; em-scaled, so `size` maps to an
 * inline font-size override.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface SpinnerProps extends ComponentProps<'span'> {
	/** CSS length; scales the spinner via font-size. */
	size?: string | undefined;
}

export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['size', 'class', 'aria-label']);
	return (
		<span
			{...rest}
			class={cx('c-spinner o-square', local.class)}
			aria-label={local['aria-label'] ?? 'Loading'}
			style={local.size ? { 'font-size': local.size } : undefined}
		/>
	);
}
