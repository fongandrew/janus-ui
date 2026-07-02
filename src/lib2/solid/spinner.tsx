import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface SpinnerProps extends ComponentProps<'span'> {
	/** Inline size override (sets `inline-size` / `block-size`). */
	size?: string;
}

/** Spinner (§10.1) — `c-spinner o-square`, `role="status"` + loading label. */
export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['size', 'class', 'style', 'role', 'aria-label']);
	const style = (): JSX.CSSProperties => ({
		...(local.size ? { 'inline-size': local.size, 'block-size': local.size } : {}),
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return (
		<span
			{...rest}
			role={local.role ?? 'status'}
			aria-label={local['aria-label'] ?? 'Loading'}
			class={cx('c-spinner o-square', local.class)}
			style={style()}
		/>
	);
}
