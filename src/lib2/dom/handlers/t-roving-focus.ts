/**
 * t-roving-focus — single-tabindex group with arrow-key navigation
 * (§12.2.4). Powers tabs, menus, toolbars, listboxes. Reads
 * aria-orientation for axis. Markup ships items at default tab order (the
 * no-JS fallback is tabbing through items individually); the mount hook
 * demotes non-active items.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { navigableItems } from '~/lib2/dom/focusables';

function activeIndex(items: HTMLElement[]): number {
	const selected = items.findIndex(
		(item) =>
			item.getAttribute('aria-selected') === 'true' ||
			item.getAttribute('aria-checked') === 'true' ||
			(item as HTMLInputElement).checked === true,
	);
	return selected >= 0 ? selected : 0;
}

function applyRovingTabindex(items: HTMLElement[], active: number): void {
	items.forEach((item, i) => {
		item.tabIndex = i === active ? 0 : -1;
	});
}

registerBehavior('t-roving-focus', {
	mount(el) {
		const items = navigableItems(el);
		if (items.length) applyRovingTabindex(items, activeIndex(items));
	},

	keydown(el, ev: KeyboardEvent) {
		const axis = el.getAttribute('aria-orientation') ?? 'horizontal';
		const nextKeys =
			axis === 'vertical'
				? ['ArrowDown']
				: axis === 'both'
					? ['ArrowRight', 'ArrowDown']
					: ['ArrowRight'];
		const prevKeys =
			axis === 'vertical'
				? ['ArrowUp']
				: axis === 'both'
					? ['ArrowLeft', 'ArrowUp']
					: ['ArrowLeft'];

		const items = navigableItems(el);
		if (!items.length) return;
		const current = items.indexOf(ev.target as HTMLElement);
		if (current === -1 && !['Home', 'End'].includes(ev.key)) return;

		let next: number | null = null;
		if (nextKeys.includes(ev.key)) next = (current + 1) % items.length;
		else if (prevKeys.includes(ev.key)) next = (current - 1 + items.length) % items.length;
		else if (ev.key === 'Home') next = 0;
		else if (ev.key === 'End') next = items.length - 1;

		if (next === null) return;
		ev.preventDefault();
		applyRovingTabindex(items, next);
		items[next]?.focus();
	},
});

/** Producer: spread onto the group element. */
export function rovingFocus(opts: { axis: 'horizontal' | 'vertical' | 'both' }) {
	return {
		'data-js': concat('t-roving-focus'),
		'aria-orientation': only(opts.axis),
	};
}
