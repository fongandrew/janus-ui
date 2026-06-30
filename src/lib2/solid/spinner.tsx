/** `Spinner` (§13.7) — `c-spinner`, an indeterminate loading ring (CSS animation). */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface SpinnerProps extends ComponentProps<'span'> {
	/** Inline `font-size` override -- the ring is sized in `em`. */
	size?: string | undefined;
}

export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['size', 'class']);
	return (
		<span
			role="img"
			aria-label="Loading"
			{...rest}
			{...(local.size ? { style: { 'font-size': local.size } } : {})}
			class={cx('c-spinner', local.class)}
		/>
	);
}
