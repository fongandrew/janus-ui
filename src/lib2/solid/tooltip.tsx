/**
 * `Tooltip` (§13.7) — `c-tooltip`, an anchored `[popover]`. Pure CSS
 * positioning, no JS (see `anchor-position.ts`). `@chromium-only`. Showing
 * the tooltip on hover is the consumer's job, on their own trigger markup
 * -- e.g. `<button interestfor={id}>` (Chromium's hover-triggered popover
 * invoker) or `popovertarget={id}` for click-to-show.
 */

import { createUniqueId, type JSX } from 'solid-js';

import { anchorNameRule, anchorPositionStyle } from '~/lib2/solid/anchor-position';

export interface TooltipProps {
	id?: string | undefined;
	content: JSX.Element;
	/** ID of the anchor element this tooltip positions against. */
	anchor: string;
}

export function Tooltip(props: TooltipProps) {
	/* eslint-disable solid/reactivity -- id/anchor are captured once and stay stable */
	const id = props.id ?? createUniqueId();
	const anchor = props.anchor;
	/* eslint-enable solid/reactivity */

	return (
		<>
			<style>{anchorNameRule('ttip', anchor)}</style>
			<div
				id={id}
				role="tooltip"
				popover="manual"
				class="c-tooltip"
				style={anchorPositionStyle('ttip', anchor, 'top')}
			>
				{props.content}
			</div>
		</>
	);
}
