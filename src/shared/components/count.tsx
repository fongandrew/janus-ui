import cx from 'classix';
import { createMemo, type JSX, splitProps } from 'solid-js';

export interface CountProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	/** Count */
	value: number;
	/**
	 * Significant figures to round to. Defaults to 1, which means 2 digit numbers become
	 * "9+". If set to 2, then 3 digit numbers would become "99+".
	 */
	digits?: number;
	/**
	 * Screenreader friendly label. Can be function which takes value (which is either the
	 * numeric value or a string like `9+`) or just a string (in which case it is added after
	 * the value as suffix).
	 */
	label: string | ((value: string | number) => string);
}

export function Count(props: CountProps) {
	const [local, rest] = splitProps(props, ['value', 'digits', 'label']);
	const digits = () => local.digits ?? 1;
	const truncated = createMemo(() => {
		const limit = Math.pow(10, digits()) - 1;
		return local.value > limit ? `${limit}+` : local.value;
	});
	const label = createMemo(() => {
		if (typeof local.label === 'function') {
			return local.label(truncated());
		}
		return `${truncated()} ${local.label}`;
	});
	return (
		<span {...rest} class={cx('o-badge', rest.class)} aria-label={label()}>
			{/* Fixed width, +1 ch for width because of `+` sign */}
			<span class="t-block" style={{ width: `${digits() + 1}ch` }}>
				{truncated()}
			</span>
		</span>
	);
}
