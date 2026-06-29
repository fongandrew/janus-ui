/**
 * `Spinner` (§13.7). A CSS-animated loading indicator. Composes `o-square`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface SpinnerProps extends ComponentProps<'span'> {
	/** Inline size override (e.g. "2rem"). */
	size?: string;
}

export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['size', 'class', 'style']);
	return (
		<span
			{...rest}
			role="status"
			aria-label="Loading"
			class={cx('c-spinner', local.class)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.size ? { 'inline-size': local.size, 'block-size': local.size } : {}),
			}}
		/>
	);
}
