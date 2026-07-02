import cx from 'classix';
import { type ComponentProps, createUniqueId, type JSX, splitProps } from 'solid-js';

export interface TooltipProps extends Omit<ComponentProps<'div'>, 'children'> {
	/** Tooltip body. */
	content: JSX.Element;
	/** `anchor-name` (without leading `--`) of the element this tooltip tracks. */
	anchor: string;
	id?: string;
}

/**
 * Tooltip (§10.1) — a `[popover]` positioned with CSS anchor positioning. No JS.
 * The anchor element must set `anchor-name: --{anchor}` (see the components page)
 * and typically toggles the tooltip via `popovertarget={tooltip id}`.
 */
export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['content', 'anchor', 'class', 'id', 'style']);
	const id = local.id ?? createUniqueId();
	const style = (): JSX.CSSProperties => ({
		'position-anchor': `--${local.anchor}`,
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return (
		<div
			{...rest}
			id={id}
			popover
			role="tooltip"
			class={cx('c-tooltip o-caption v-colors-tooltip', local.class)}
			style={style()}
		>
			{local.content}
		</div>
	);
}
