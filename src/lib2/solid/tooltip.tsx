/**
 * `Tooltip` (§13.7) — `c-tooltip`, an anchored `[popover]`. Pure CSS
 * positioning (no JS): a scoped `<style>` tag gives the anchor element an
 * `anchor-name`, and the popover positions off it via `position-anchor` +
 * `position-area`. `@chromium-only` -- anchor positioning is one of the two
 * genuinely Chromium-leading features at the project's browser minimums
 * (§15). Showing the tooltip on hover is the consumer's job, on their own
 * trigger markup -- e.g. `<button interestfor={id}>` (Chromium's hover-
 * triggered popover invoker) or `popovertarget={id}` for click-to-show.
 */

import { createUniqueId, type JSX } from 'solid-js';

/** `position-anchor` / `position-area` (CSS anchor positioning) aren't in solid-js's `CSSProperties` typings yet. */
type AnchorStyle = JSX.CSSProperties & { 'position-anchor'?: string; 'position-area'?: string };

export interface TooltipProps {
	id?: string | undefined;
	content: JSX.Element;
	/** ID of the anchor element this tooltip positions against. */
	anchor: string;
}

export function Tooltip(props: TooltipProps) {
	/* eslint-disable solid/reactivity -- id/anchor are captured once and stay stable */
	const id = props.id ?? createUniqueId();
	const anchorName = `--ttip-${props.anchor}`;
	/* eslint-enable solid/reactivity */

	return (
		<>
			<style>{`#${CSS.escape(props.anchor)} { anchor-name: ${anchorName}; }`}</style>
			<div
				id={id}
				role="tooltip"
				popover="manual"
				class="c-tooltip"
				style={{ 'position-anchor': anchorName, 'position-area': 'top' } as AnchorStyle}
			>
				{props.content}
			</div>
		</>
	);
}
