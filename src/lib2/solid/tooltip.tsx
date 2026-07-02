/**
 * Tooltip (§13.7) — anchored `[popover]` (`c-tooltip`), no JS. The anchor
 * element sets `anchor-name: --tooltip-anchor` (the name c-tooltip tracks);
 * pass `anchor` to track a custom anchor-name instead.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface TooltipProps extends Omit<ComponentProps<'div'>, 'children'> {
	id: string;
	content: JSX.Element;
	/** Custom anchor-name (e.g. "--my-anchor") when the default is taken. */
	anchor?: string | undefined;
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['content', 'anchor', 'class', 'style']);
	return (
		<div
			{...rest}
			popover="manual"
			role="tooltip"
			class={cx('c-tooltip o-caption', local.class)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.anchor ? { 'position-anchor': local.anchor } : {}),
			}}
		>
			{local.content}
		</div>
	);
}
