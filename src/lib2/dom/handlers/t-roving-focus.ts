/**
 * t-roving-focus (§12.2.4) — single-tabindex group with arrow-key navigation.
 * Markup ships items at default tab order; the mount hook demotes non-active
 * items to tabindex="-1". Reads aria-orientation for the axis.
 */
import { concat, only } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const ITEM_SELECTOR =
	'[role="tab"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [data-roving-item]';

function items(group: Element): HTMLElement[] {
	return [...group.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter(
		(el) => el.getAttribute('aria-disabled') !== 'true' && !el.hasAttribute('disabled'),
	);
}

function axis(group: Element): 'horizontal' | 'vertical' | 'both' {
	const o = group.getAttribute('aria-orientation');
	return o === 'horizontal' || o === 'both' ? o : 'vertical';
}

function focusItem(list: HTMLElement[], index: number): void {
	const wrapped = (index + list.length) % list.length;
	list.forEach((el, i) => {
		el.tabIndex = i === wrapped ? 0 : -1;
	});
	list[wrapped]?.focus();
}

registerBehavior('t-roving-focus', {
	mount(el) {
		const list = items(el);
		if (!list.length) return;
		const active = list.findIndex((it) => it.getAttribute('aria-selected') === 'true' || it.tabIndex === 0);
		list.forEach((it, i) => {
			it.tabIndex = i === (active === -1 ? 0 : active) ? 0 : -1;
		});
	},
	keydown(el, ev) {
		const e = ev as KeyboardEvent;
		const list = items(el);
		if (!list.length) return;
		const current = list.indexOf(document.activeElement as HTMLElement);
		if (current === -1) return;
		const ax = axis(el);
		const next = ax === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
		const prev = ax === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
		const nextBoth = ax === 'both';

		let target: number | null = null;
		if (e.key === next || (nextBoth && (e.key === 'ArrowRight' || e.key === 'ArrowDown'))) {
			target = current + 1;
		} else if (e.key === prev || (nextBoth && (e.key === 'ArrowLeft' || e.key === 'ArrowUp'))) {
			target = current - 1;
		} else if (e.key === 'Home') {
			target = 0;
		} else if (e.key === 'End') {
			target = list.length - 1;
		}

		if (target !== null) {
			e.preventDefault();
			focusItem(list, target);
		}
	},
});

export function rovingFocus(opts: { axis?: 'horizontal' | 'vertical' | 'both' } = {}) {
	return {
		'data-js': concat('t-roving-focus'),
		...(opts.axis ? { 'aria-orientation': only(opts.axis) } : {}),
	};
}
