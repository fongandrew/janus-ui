/**
 * `Tooltip` (§13.7). An anchored `[popover]` tooltip, always inverted via
 * `v-colors-tooltip`. Pure CSS anchor positioning — no JS.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface TooltipProps extends Omit<ComponentProps<'div'>, 'id'> {
	id: string;
	/** ID of the anchor element this tooltip positions against. */
	anchor: string;
	content: JSX.Element;
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['anchor', 'content', 'class']);
	return (
		<div
			{...rest}
			popover="manual"
			role="tooltip"
			class={cx('c-tooltip', local.class)}
			style={{ 'position-anchor': `--${local.anchor}` } as Record<string, string>}
		>
			{local.content}
		</div>
	);
}
