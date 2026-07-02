import cx from 'classix';
import { type ComponentProps, createUniqueId, type JSX, splitProps } from 'solid-js';

export interface PopoverProps extends ComponentProps<'div'> {
	id?: string;
	/** `anchor-name` (without leading `--`) of the element this popover tracks. */
	anchor?: string;
}

/**
 * Popover (§10.2) — a `[popover]` with the request-close behavior. Open it with
 * a trigger carrying `popovertarget={id}`; position it via CSS anchoring when an
 * `anchor` is supplied (the trigger must set `anchor-name: --{anchor}`).
 */
export function Popover(props: PopoverProps) {
	const [local, rest] = splitProps(props, ['id', 'anchor', 'class', 'style']);
	const id = local.id ?? createUniqueId();
	const style = (): JSX.CSSProperties => ({
		...(local.anchor ? { 'position-anchor': `--${local.anchor}` } : {}),
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return (
		<div
			{...rest}
			id={id}
			popover
			data-js="t-request-close"
			class={cx('c-popover', local.class)}
			style={style()}
		/>
	);
}
