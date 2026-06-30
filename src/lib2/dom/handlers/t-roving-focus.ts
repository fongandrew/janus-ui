/**
 * `t-roving-focus` — single-tabindex group with arrow-key navigation
 * (tabs, menus, toolbars, listboxes). Markup ships items at default tab
 * order; the `mount` hook demotes non-active items to `tabindex="-1"` so
 * the no-JS fallback (tab through items individually) still works.
 */

import { type AttrValue, concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

export type RovingFocusAxis = 'horizontal' | 'vertical' | 'both';

const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

function isDisabled(el: HTMLElement): boolean {
	return (
		el.getAttribute('aria-disabled') === 'true' || (el as HTMLButtonElement).disabled === true
	);
}

function items(el: Element): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(`:scope > ${FOCUSABLE_SELECTOR}`)).filter(
		(item) => !isDisabled(item),
	);
}

function activate(list: HTMLElement[], index: number): void {
	list.forEach((item, i) => {
		item.tabIndex = i === index ? 0 : -1;
	});
}

registerBehavior('t-roving-focus', {
	mount(el) {
		const list = items(el);
		let index = list.findIndex(
			(item) =>
				item.getAttribute('aria-selected') === 'true' ||
				item.getAttribute('aria-current') === 'true' ||
				item.hasAttribute('data-active'),
		);
		if (index < 0) {
			index = 0;
		}
		activate(list, index);
	},
	keydown(el, ev) {
		const axis = (el.getAttribute('data-roving-axis') ?? 'horizontal') as RovingFocusAxis;
		const wrap = el.getAttribute('data-roving-wrap') === 'true';
		const homeEnd = el.getAttribute('data-roving-home-end') === 'true';

		const list = items(el);
		if (list.length === 0) {
			return;
		}
		const current = list.indexOf(el.ownerDocument.activeElement as HTMLElement);
		if (current < 0) {
			return;
		}

		const isNext =
			(axis !== 'vertical' && ev.key === 'ArrowRight') ||
			(axis !== 'horizontal' && ev.key === 'ArrowDown');
		const isPrev =
			(axis !== 'vertical' && ev.key === 'ArrowLeft') ||
			(axis !== 'horizontal' && ev.key === 'ArrowUp');

		let next: number;
		if (isNext) {
			next = current + 1;
		} else if (isPrev) {
			next = current - 1;
		} else if (homeEnd && ev.key === 'Home') {
			next = 0;
		} else if (homeEnd && ev.key === 'End') {
			next = list.length - 1;
		} else {
			return;
		}

		if (next < 0) {
			next = wrap ? list.length - 1 : 0;
		} else if (next >= list.length) {
			next = wrap ? 0 : list.length - 1;
		}

		ev.preventDefault();
		activate(list, next);
		list[next]!.focus();
	},
});

export interface RovingFocusOptions {
	axis: RovingFocusAxis;
	wrap?: boolean;
	homeEnd?: boolean;
}

/** Producer: opts a container into `t-roving-focus`. */
export function rovingFocus(opts: RovingFocusOptions): Record<string, AttrValue> {
	return {
		'data-js': concat('t-roving-focus'),
		'aria-orientation': opts.axis === 'both' ? undefined : only(opts.axis),
		'data-roving-axis': only(opts.axis),
		'data-roving-wrap': opts.wrap ? only('true') : undefined,
		'data-roving-home-end': opts.homeEnd ? only('true') : undefined,
	};
}
