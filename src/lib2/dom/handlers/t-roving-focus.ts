/**
 * `t-roving-focus` — single-tabindex group with arrow-key navigation (§12.2.4).
 *
 * Powers tabs, menus, toolbars, listboxes. Markup ships items at default tab order
 * (no hand-written `tabindex="-1"`); the `mount` hook demotes non-active items.
 * No-JS fallback: Tab through items individually.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { ROVING_ITEM_SELECTOR } from '~/lib2/dom/focusables';

function items(group: HTMLElement): HTMLElement[] {
	return Array.from(group.querySelectorAll<HTMLElement>(ROVING_ITEM_SELECTOR)).filter(
		// Exclude items belonging to a nested roving group.
		(el) => el.closest('[data-js~="t-roving-focus"]') === group,
	);
}

function setActive(group: HTMLElement, target: HTMLElement): void {
	for (const item of items(group)) {
		item.tabIndex = item === target ? 0 : -1;
	}
	target.focus();
}

function axisKeys(group: HTMLElement): { next: string[]; prev: string[] } {
	const axis = group.getAttribute('aria-orientation') ?? 'horizontal';
	if (axis === 'vertical') return { next: ['ArrowDown'], prev: ['ArrowUp'] };
	if (axis === 'both') {
		return { next: ['ArrowDown', 'ArrowRight'], prev: ['ArrowUp', 'ArrowLeft'] };
	}
	return { next: ['ArrowRight'], prev: ['ArrowLeft'] };
}

registerBehavior('t-roving-focus', {
	mount(group) {
		const list = items(group);
		const active = list.find((el) => el.getAttribute('aria-selected') === 'true') ?? list[0];
		for (const item of list) item.tabIndex = item === active ? 0 : -1;
	},
	keydown(group, ev) {
		const event = ev as KeyboardEvent;
		const list = items(group);
		if (!list.length) return;
		const current = list.findIndex((el) => el === group.ownerDocument.activeElement);
		if (current < 0) return;

		const { next, prev } = axisKeys(group);
		const wrap = group.getAttribute('data-roving-wrap') !== 'false';
		let target: HTMLElement | undefined;

		if (next.includes(event.key)) {
			target = list[current + 1] ?? (wrap ? list[0] : list[current]);
		} else if (prev.includes(event.key)) {
			target = list[current - 1] ?? (wrap ? list[list.length - 1] : list[current]);
		} else if (event.key === 'Home') {
			target = list[0];
		} else if (event.key === 'End') {
			target = list[list.length - 1];
		}

		if (target) {
			event.preventDefault();
			setActive(group, target);
		}
	},
});

export interface RovingFocusOptions {
	axis: 'horizontal' | 'vertical' | 'both';
	wrap?: boolean;
}

/** Producer: opt an element into roving focus. Reads `aria-orientation` for axis. */
export function rovingFocus(opts: RovingFocusOptions) {
	return {
		'data-js': concat('t-roving-focus'),
		'aria-orientation': only(opts.axis),
		...(opts.wrap === false ? { 'data-roving-wrap': only('false') } : {}),
	};
}
