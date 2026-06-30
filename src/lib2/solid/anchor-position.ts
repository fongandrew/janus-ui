/**
 * Shared CSS-anchor-positioning helper for `Tooltip` and `Popover`
 * (`@chromium-only` -- one of the two genuinely Chromium-leading features at
 * the project's browser minimums, §15). A scoped `<style>` tag gives the
 * anchor element an `anchor-name`; the floating element positions off it via
 * `position-anchor` + `position-area`. Pure CSS, no JS.
 */
import { type JSX } from 'solid-js';

/** `position-anchor` / `position-area` aren't in solid-js's `CSSProperties` typings yet. */
export type AnchorStyle = JSX.CSSProperties & {
	'position-anchor'?: string;
	'position-area'?: string;
};

export function anchorName(prefix: string, anchorId: string): string {
	return `--${prefix}-${anchorId}`;
}

/** CSS text assigning `anchor-name` to the element with id `anchorId`. Render inside a `<style>` tag. */
export function anchorNameRule(prefix: string, anchorId: string): string {
	return `#${CSS.escape(anchorId)} { anchor-name: ${anchorName(prefix, anchorId)}; }`;
}

export function anchorPositionStyle(prefix: string, anchorId: string, area = 'top'): AnchorStyle {
	return { 'position-anchor': anchorName(prefix, anchorId), 'position-area': area };
}
